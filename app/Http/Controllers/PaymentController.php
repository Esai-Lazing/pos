<?php

namespace App\Http\Controllers;

use App\Models\Abonnement;
use App\Services\MobileMoneyService;
use App\Services\PaymentService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private StripeService $stripeService,
        private MobileMoneyService $mobileMoneyService
    ) {}

    /**
     * Afficher la page de paiement selon le mode choisi
     */
    public function show(Request $request): Response
    {
        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            abort(404);
        }

        // Récupérer le dernier abonnement (même s'il n'est pas encore actif)
        // Utiliser latest('id') pour s'assurer d'avoir le dernier créé
        // Forcer un rechargement depuis la DB en utilisant fresh() directement sur la relation
        $restaurant = $user->restaurant;

        // Récupérer directement depuis la DB sans passer par la relation pour éviter le cache
        $abonnement = \App\Models\Abonnement::where('restaurant_id', $restaurant->id)
            ->orderBy('updated_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        if (! $abonnement) {
            abort(404);
        }

        // Toujours rafraîchir depuis la base de données pour éviter les problèmes de cache
        $abonnement = $abonnement->fresh();

        // Rediriger selon le mode de paiement
        switch ($abonnement->mode_paiement) {
            case 'mobile_money':
                return $this->showMobileMoney($abonnement);
            case 'carte_bancaire':
                return $this->showCreditCard($abonnement);
            case 'espece':
                return $this->showCash($abonnement);
            default:
                abort(404);
        }
    }

    /**
     * Page de paiement Mobile Money avec OTP
     */
    private function showMobileMoney(Abonnement $abonnement): Response
    {
        // Récupérer la dernière transaction en attente
        $transaction = $abonnement->paymentTransactions()
            ->where('status', 'pending')
            ->where('provider', 'in', ['orange_money', 'airtel_money'])
            ->latest()
            ->first();

        $otpSent = false;
        $otpExpiresAt = null;
        $transactionId = null;
        $paymentUrl = null;

        if ($transaction) {
            $otpSent = true;
            $otpExpiresAt = $abonnement->otp_expires_at?->format('Y-m-d H:i:s');
            $transactionId = $transaction->transaction_id;
            $paymentUrl = $transaction->metadata['payment_url'] ?? null;
        }

        // Déterminer le provider depuis la transaction ou la config
        $provider = $transaction?->provider ?? config('services.mobile_money.provider', 'orange_money');

        return Inertia::render('Payment/MobileMoney', [
            'abonnement' => [
                'id' => $abonnement->id,
                'plan' => $abonnement->plan,
                'montant' => (float) $abonnement->montant_mensuel,
                'otp_sent' => $otpSent,
                'otp_expires_at' => $otpExpiresAt,
                'transaction_id' => $transactionId,
                'payment_url' => $paymentUrl,
            ],
            'provider' => $provider,
            'available_providers' => [
                'airtel_money' => [
                    'name' => 'Airtel Money',
                    'enabled' => ! empty(config('services.mobile_money.airtel_money.client_id')),
                ],
                'orange_money' => [
                    'name' => 'Orange Money',
                    'enabled' => ! empty(config('services.mobile_money.orange_money.merchant_id')),
                ],
            ],
        ]);
    }

    /**
     * Page de paiement par carte bancaire
     */
    private function showCreditCard(Abonnement $abonnement): Response
    {
        // Vérifier si Stripe est configuré
        $stripeKey = config('services.stripe.key');
        $stripeSecret = config('services.stripe.secret');

        $checkoutSession = null;
        $checkoutUrl = null;
        $checkoutSessionId = null;
        $stripeError = null;

        if (empty($stripeSecret)) {
            $stripeError = 'Stripe n\'est pas configuré. Veuillez configurer STRIPE_SECRET dans votre fichier .env';
        } else {
            // Créer une session Stripe Checkout
            try {
                $checkoutSession = $this->stripeService->createCheckoutSession(
                    $abonnement,
                    route('payment.success'),
                    route('payment.cancel')
                );

                if ($checkoutSession['success'] ?? false) {
                    $checkoutUrl = $checkoutSession['url'] ?? null;
                    $checkoutSessionId = $checkoutSession['session_id'] ?? null;
                } else {
                    $stripeError = $checkoutSession['error'] ?? 'Erreur lors de la création de la session de paiement';
                }
            } catch (\Exception $e) {
                $stripeError = $e->getMessage();
            }
        }

        return Inertia::render('Payment/CreditCard', [
            'abonnement' => [
                'id' => $abonnement->id,
                'plan' => $abonnement->plan,
                'montant' => (float) $abonnement->montant_mensuel,
            ],
            'stripe_key' => $stripeKey,
            'checkout_session_id' => $checkoutSessionId,
            'checkout_url' => $checkoutUrl,
            'stripe_error' => $stripeError,
        ]);
    }

    /**
     * Page d'attente pour paiement en espèce
     */
    private function showCash(Abonnement $abonnement): Response
    {
        // Récupérer le montant depuis le plan prédéfini pour garantir la cohérence
        $plan = \App\Models\SubscriptionPlan::getPlanBySlug($abonnement->plan);
        $montant = $plan['montant_mensuel'] ?? (float) $abonnement->montant_mensuel;

        return Inertia::render('Payment/Cash', [
            'abonnement' => [
                'id' => $abonnement->id,
                'plan' => $abonnement->plan,
                'montant' => (float) $montant,
                'statut_paiement' => $abonnement->statut_paiement,
                'statut' => $abonnement->statut,
                'est_actif' => $abonnement->est_actif,
                'date_fin' => $abonnement->date_fin?->format('Y-m-d'),
                'mode_paiement' => $abonnement->mode_paiement,
            ],
        ]);
    }

    /**
     * Initier un paiement Mobile Money
     */
    public function initiateMobileMoney(Request $request): RedirectResponse
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'regex:/^(\+?243|0)[0-9]{9}$/'],
            'provider' => ['nullable', 'string', Rule::in(['airtel_money', 'orange_money'])],
        ]);

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return back()->withErrors(['phone_number' => 'Utilisateur non trouvé.']);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return back()->withErrors(['phone_number' => 'Abonnement non trouvé.']);
        }

        if ($abonnement->mode_paiement !== 'mobile_money') {
            return back()->withErrors(['phone_number' => 'Mode de paiement invalide.']);
        }

        $provider = $request->provider ?? config('services.mobile_money.provider', 'orange_money');
        $result = $this->mobileMoneyService->initiatePayment($abonnement, $request->phone_number, $provider);

        if (! ($result['success'] ?? false)) {
            return back()->withErrors(['phone_number' => $result['error'] ?? 'Erreur lors de l\'initiation du paiement.']);
        }

        // Générer un OTP local pour confirmation
        if ($result['requires_otp'] ?? false) {
            $abonnement->generateOtp();
        }

        // Stocker le provider dans la session pour référence
        session(['mobile_money_provider' => $provider]);

        return redirect()->route('payment.show')->with('success', $result['message'] ?? 'Paiement initié avec succès.');
    }

    /**
     * Callback après paiement Mobile Money (Orange Money, Airtel Money)
     */
    public function mobileMoneyCallback(Request $request, string $provider): RedirectResponse
    {
        $transactionId = $request->query('transaction_id') ?? $request->query('order_id') ?? $request->query('pay_token');
        $status = $request->query('status') ?? $request->query('transaction_status');

        if (! $transactionId) {
            return redirect()->route('payment.show')
                ->withErrors(['error' => 'Transaction ID manquant dans le callback.']);
        }

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return redirect()->route('payment.show')
                ->withErrors(['error' => 'Utilisateur non trouvé.']);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return redirect()->route('payment.show')
                ->withErrors(['error' => 'Abonnement non trouvé.']);
        }

        // Vérifier le statut du paiement
        $result = $this->mobileMoneyService->verifyPayment($transactionId, $provider);

        if ($result['success'] ?? false) {
            // Le paiement a été confirmé, rediriger vers le dashboard
            return redirect()->route('dashboard')
                ->with('success', 'Paiement confirmé avec succès !');
        }

        // Si le paiement n'est pas encore confirmé, retourner à la page de paiement
        return redirect()->route('payment.show')
            ->with('info', 'Votre paiement est en cours de traitement. Vous serez notifié une fois confirmé.');
    }

    /**
     * Vérifier le code OTP pour Mobile Money
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return back()->withErrors(['otp_code' => 'Utilisateur non trouvé.']);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return back()->withErrors(['otp_code' => 'Abonnement non trouvé.']);
        }

        if ($abonnement->mode_paiement !== 'mobile_money') {
            return back()->withErrors(['otp_code' => 'Mode de paiement invalide.']);
        }

        // Vérifier l'OTP local
        if (! $abonnement->verifyOtp($request->otp_code)) {
            return back()->withErrors(['otp_code' => 'Code OTP invalide ou expiré.']);
        }

        // Récupérer le provider depuis la session ou la config
        $provider = session('mobile_money_provider') ?? config('services.mobile_money.provider', 'orange_money');

        // Récupérer la transaction en attente
        $transaction = \App\Models\PaymentTransaction::where('abonnement_id', $abonnement->id)
            ->where('provider', $provider)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (! $transaction) {
            return back()->withErrors(['otp_code' => 'Transaction non trouvée.']);
        }

        // Vérifier le statut du paiement avec le provider
        $result = $this->mobileMoneyService->verifyPayment($transaction->transaction_id, $provider);

        if ($result['success'] ?? false) {
            // Le paiement a été confirmé
            return redirect()->route('dashboard')->with('success', 'Paiement confirmé avec succès !');
        }

        // Si le paiement n'est pas encore confirmé, essayer de confirmer avec l'OTP
        $confirmResult = $this->mobileMoneyService->confirmPayment($abonnement, $request->otp_code, $provider);

        if ($confirmResult['success'] ?? false) {
            return redirect()->route('dashboard')->with('success', 'Paiement confirmé avec succès !');
        }

        return back()->withErrors(['otp_code' => $confirmResult['error'] ?? 'Le paiement n\'a pas encore été confirmé. Veuillez vérifier votre compte mobile money.']);
    }

    /**
     * Renvoyer le code OTP
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'regex:/^(\+?243|0)[0-9]{9}$/'],
        ]);

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return back()->withErrors(['error' => 'Utilisateur non trouvé.']);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return back()->withErrors(['error' => 'Abonnement non trouvé.']);
        }

        if ($abonnement->mode_paiement !== 'mobile_money') {
            return back()->withErrors(['error' => 'Mode de paiement invalide.']);
        }

        // Récupérer le provider depuis la session ou la config
        $provider = session('mobile_money_provider') ?? config('services.mobile_money.provider', 'orange_money');

        // Réinitier le paiement avec le même numéro
        $result = $this->mobileMoneyService->initiatePayment($abonnement, $request->phone_number, $provider);

        if (! ($result['success'] ?? false)) {
            return back()->withErrors(['error' => $result['error'] ?? 'Erreur lors de la réinitialisation du paiement.']);
        }

        // Régénérer l'OTP local
        $abonnement->generateOtp();

        return back()->with('success', 'Un nouveau code OTP a été généré et envoyé.');
    }

    /**
     * Traiter le paiement par carte bancaire avec Stripe
     */
    public function processCreditCard(Request $request)
    {
        $request->validate([
            'payment_method_id' => ['required', 'string'],
        ]);

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return back()->withErrors(['error' => 'Utilisateur non trouvé.']);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return back()->withErrors(['error' => 'Abonnement non trouvé.']);
        }

        if ($abonnement->mode_paiement !== 'carte_bancaire') {
            return back()->withErrors(['error' => 'Mode de paiement invalide.']);
        }

        $result = $this->paymentService->processPayment($abonnement, [
            'payment_method_id' => $request->payment_method_id,
        ]);

        if (! $result['success']) {
            return back()->withErrors(['error' => $result['error'] ?? 'Erreur lors du paiement.']);
        }

        if ($result['requires_action'] ?? false) {
            // Nécessite une action supplémentaire (3D Secure)
            return Inertia::render('Payment/CreditCard3DS', [
                'client_secret' => $result['client_secret'],
                'payment_intent_id' => $result['payment_intent_id'],
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Paiement effectué avec succès !');
    }

    /**
     * Page de succès après paiement Stripe
     */
    public function success(Request $request): Response
    {
        $sessionId = $request->query('session_id');

        if ($sessionId) {
            // Vérifier le statut de la session
            $this->stripeService->verifyPayment($sessionId);
        }

        return redirect()->route('dashboard')->with('success', 'Paiement effectué avec succès !');
    }

    /**
     * Page d'annulation de paiement
     */
    public function cancel(): Response
    {
        return redirect()->route('payment.show')->with('error', 'Paiement annulé. Vous pouvez réessayer.');
    }

    /**
     * Valider un paiement en espèce (Super Admin uniquement)
     */
    public function validateCashPayment(Request $request, Abonnement $abonnement)
    {
        $user = Auth::user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé. Seul le super administrateur peut valider les paiements.');
        }

        if ($abonnement->mode_paiement !== 'espece') {
            return back()->withErrors(['error' => 'Ce paiement n\'est pas un paiement en espèce.']);
        }

        DB::transaction(function () use ($abonnement) {
            $abonnement->update([
                'statut_paiement' => 'valide',
                'statut' => 'actif',
                'est_actif' => true,
                'date_paiement' => now(),
            ]);

            $user = $abonnement->restaurant->users()->where('role', 'admin')->first();
            if ($user) {
                $user->update([
                    'is_active' => true,
                ]);
            }
        });

        return back()->with('success', 'Paiement validé avec succès.');
    }

    /**
     * Refuser un paiement en espèce (Super Admin uniquement)
     */
    public function rejectCashPayment(Request $request, Abonnement $abonnement)
    {
        $user = Auth::user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé. Seul le super administrateur peut refuser les paiements.');
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $abonnement->update([
            'statut_paiement' => 'refuse',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Paiement refusé.');
    }

    /**
     * Changer le mode de paiement
     */
    public function changePaymentMethod(Request $request): RedirectResponse
    {
        $request->validate([
            'mode_paiement' => ['required', 'string', Rule::in(['mobile_money', 'carte_bancaire', 'espece'])],
        ]);

        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            return redirect()
                ->route('payment.show')
                ->with('error', 'Utilisateur non trouvé.');
        }

        // Utiliser la même logique de récupération que la méthode show() pour la cohérence
        $abonnement = \App\Models\Abonnement::where('restaurant_id', $user->restaurant->id)
            ->orderBy('updated_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        if (! $abonnement) {
            return redirect()
                ->route('payment.show')
                ->with('error', 'Abonnement non trouvé.');
        }

        // Permettre le changement de mode de paiement même si le paiement est validé ou en cours
        // On a supprimé le blocage 'en_cours' pour éviter que l'utilisateur soit bloqué si une transaction échoue silencieusement
        /*
        if ($abonnement->statut_paiement === 'en_cours') {
            return redirect()
                ->route('payment.show')
                ->with('error', 'Le mode de paiement ne peut pas être modifié pendant qu\'un paiement est en cours.');
        }
        */

        try {
            $abonnementId = $abonnement->id;

            DB::beginTransaction();

            $abonnement->update([
                'mode_paiement' => $request->mode_paiement,
                // Réinitialiser le statut du paiement si on change de mode
                'statut_paiement' => 'en_attente',
                // Mettre à jour updated_at pour que latest() le récupère
                'updated_at' => now(),
            ]);

            // Générer un nouvel OTP si le mode est mobile_money
            if ($request->mode_paiement === 'mobile_money') {
                $abonnement->generateOtp();
            }

            DB::commit();

            // Forcer le rafraîchissement de l'abonnement depuis la DB après le commit
            $abonnement->refresh();

            // Rediriger vers la page de paiement - Inertia suivra automatiquement la redirection
            // et la méthode show() détectera le nouveau mode de paiement
            return redirect()
                ->route('payment.show')
                ->with('success', 'Mode de paiement modifié avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors du changement de mode de paiement: '.$e->getMessage());

            return redirect()
                ->route('payment.show')
                ->with('error', 'Une erreur est survenue lors du changement de mode de paiement. Veuillez réessayer.');
        }
    }
}
