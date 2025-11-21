<?php

namespace App\Http\Controllers;

use App\Models\Abonnement;
use App\Models\Invoice;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * Afficher la page de gestion d'abonnement
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            abort(404);
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        $invoices = $abonnement
            ? Invoice::where('abonnement_id', $abonnement->id)
                ->latest()
                ->paginate(10)
            : collect();

        $transactions = $abonnement
            ? \App\Models\PaymentTransaction::where('abonnement_id', $abonnement->id)
                ->latest()
                ->paginate(10)
            : collect();

        // Statistiques d'utilisation
        $usage = [];
        if ($abonnement && $user->restaurant) {
            $limitations = $abonnement->getLimitations();
            $restaurant = $user->restaurant;

            $nonServeurCount = $restaurant->users()
                ->where('role', '!=', 'serveur')
                ->count();
            $serveurCount = $restaurant->users()
                ->where('role', 'serveur')
                ->count();

            $usage = [
                'users' => [
                    'current' => $nonServeurCount,
                    'limit' => $limitations['max_users'] ?? null,
                    'percentage' => $limitations['max_users']
                        ? min(100, ($nonServeurCount / $limitations['max_users']) * 100)
                        : 0,
                ],
                'serveurs' => [
                    'current' => $serveurCount,
                    'limit' => $limitations['max_serveurs'] ?? null,
                    'percentage' => $limitations['max_serveurs']
                        ? min(100, ($serveurCount / $limitations['max_serveurs']) * 100)
                        : 0,
                ],
                'products' => [
                    'current' => $restaurant->produits()->count(),
                    'limit' => $limitations['max_produits'] ?? null,
                    'percentage' => $limitations['max_produits']
                        ? min(100, ($restaurant->produits()->count() / $limitations['max_produits']) * 100)
                        : 0,
                ],
                'sales' => [
                    'current' => $restaurant->ventes()
                        ->whereYear('created_at', now()->year)
                        ->whereMonth('created_at', now()->month)
                        ->count(),
                    'limit' => $limitations['max_ventes_mois'] ?? null,
                    'percentage' => $limitations['max_ventes_mois']
                        ? min(100, ($restaurant->ventes()
                            ->whereYear('created_at', now()->year)
                            ->whereMonth('created_at', now()->month)
                            ->count() / $limitations['max_ventes_mois']) * 100)
                        : 0,
                ],
            ];
        }

        return Inertia::render('Subscription/Index', [
            'abonnement' => $abonnement,
            'invoices' => $invoices,
            'transactions' => $transactions,
            'usage' => $usage,
            'plans' => \App\Models\SubscriptionPlan::getPlans(),
        ]);
    }

    /**
     * Générer une facture
     */
    public function generateInvoice(Request $request, Abonnement $abonnement)
    {
        $user = Auth::user();
        if (! $user || $user->restaurant_id !== $abonnement->restaurant_id) {
            abort(403);
        }

        $invoice = $this->paymentService->generateInvoice($abonnement);

        return redirect()->back()->with('success', 'Facture générée avec succès.');
    }

    /**
     * Mettre à jour le plan et le mode de paiement
     */
    public function updatePlan(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = Auth::user();
        if (! $user || ! $user->restaurant) {
            abort(404);
        }

        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:simple,medium,premium'],
            'mode_paiement' => ['required', 'string', 'in:espece,carte_bancaire,mobile_money'],
        ]);

        $abonnement = $user->restaurant->abonnements()->latest()->first();
        if (! $abonnement) {
            return redirect()
                ->route('subscription.index')
                ->with('error', 'Abonnement non trouvé.');
        }

        // Mettre à jour le plan et le mode de paiement
        $abonnement->update([
            'plan' => $validated['plan'],
            'mode_paiement' => $validated['mode_paiement'],
            'statut_paiement' => 'en_attente',
            'updated_at' => now(),
        ]);

        // Générer un nouvel OTP si le mode est mobile_money
        if ($validated['mode_paiement'] === 'mobile_money') {
            $abonnement->generateOtp();
        }

        return redirect()
            ->route('payment.show')
            ->with('success', 'Plan et mode de paiement mis à jour. Veuillez compléter le paiement.');
    }
}
