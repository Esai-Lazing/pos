<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Services\MobileMoneyService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
        private MobileMoneyService $mobileMoneyService
    ) {}

    /**
     * Gérer les webhooks Stripe
     */
    public function stripe(Request $request): Response
    {
        $payload = $request->all();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            // Vérifier la signature du webhook
            \Stripe\Webhook::constructEvent(
                $request->getContent(),
                $sigHeader,
                $webhookSecret
            );

            $this->stripeService->handleWebhook($payload);

            return response()->json(['received' => true]);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: '.$e->getMessage());

            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Gérer les webhooks Mobile Money (Airtel Money, Orange Money)
     */
    public function mobileMoney(Request $request, ?string $provider = null): Response
    {
        $provider = $provider ?? $request->route('provider') ?? config('services.mobile_money.provider', 'orange_money');
        $payload = $request->all();

        try {
            Log::info('Mobile Money webhook received', [
                'provider' => $provider,
                'payload' => $payload,
            ]);

            // Traiter selon le provider
            match ($provider) {
                'airtel_money' => $this->handleAirtelMoneyWebhook($payload),
                'orange_money' => $this->handleOrangeMoneyWebhook($payload),
                default => throw new \Exception("Provider non supporté: {$provider}"),
            };

            return response()->json(['received' => true, 'status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Mobile Money webhook error: '.$e->getMessage(), [
                'provider' => $provider,
                'payload' => $payload,
            ]);

            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Gérer les webhooks Airtel Money
     */
    private function handleAirtelMoneyWebhook(array $payload): void
    {
        $transactionId = $payload['transaction']['id'] ?? $payload['data']['transaction']['id'] ?? null;
        $status = $payload['transaction']['status'] ?? $payload['data']['transaction']['status'] ?? null;

        if (! $transactionId) {
            throw new \Exception('Transaction ID manquant dans le webhook Airtel Money');
        }

        $transaction = PaymentTransaction::where('transaction_id', $transactionId)
            ->where('provider', 'airtel_money')
            ->first();

        if (! $transaction) {
            Log::warning('Transaction Airtel Money non trouvée', ['transaction_id' => $transactionId]);
            throw new \Exception('Transaction non trouvée');
        }

        // TS = Transaction Successful
        if ($status === 'TS' && $transaction->status !== 'completed') {
            DB::transaction(function () use ($transaction) {
                $transaction->update([
                    'status' => 'completed',
                    'processed_at' => now(),
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'webhook_payload' => $payload,
                    ]),
                ]);

                $abonnement = $transaction->abonnement;
                if ($abonnement && $abonnement->statut_paiement !== 'valide') {
                    $abonnement->update([
                        'statut_paiement' => 'valide',
                        'statut' => 'actif',
                        'est_actif' => true,
                        'date_paiement' => now(),
                        'numero_transaction' => $transaction->transaction_id,
                    ]);

                    // Activer l'utilisateur
                    $user = $abonnement->restaurant->users()->where('role', 'admin')->first();
                    if ($user) {
                        $user->update(['is_active' => true]);
                    }
                }
            });
        }
    }

    /**
     * Gérer les webhooks Orange Money
     */
    private function handleOrangeMoneyWebhook(array $payload): void
    {
        $transactionId = $payload['order_id'] ?? $payload['pay_token'] ?? $payload['reference'] ?? null;
        $status = $payload['status'] ?? $payload['transaction_status'] ?? null;

        if (! $transactionId) {
            throw new \Exception('Transaction ID manquant dans le webhook Orange Money');
        }

        $transaction = PaymentTransaction::where('transaction_id', $transactionId)
            ->where('provider', 'orange_money')
            ->first();

        if (! $transaction) {
            Log::warning('Transaction Orange Money non trouvée', ['transaction_id' => $transactionId]);
            throw new \Exception('Transaction non trouvée');
        }

        // SUCCESS ou SUCCESSFUL = Transaction réussie
        if (in_array($status, ['SUCCESS', 'SUCCESSFUL']) && $transaction->status !== 'completed') {
            DB::transaction(function () use ($transaction) {
                $transaction->update([
                    'status' => 'completed',
                    'processed_at' => now(),
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'webhook_payload' => $payload,
                    ]),
                ]);

                $abonnement = $transaction->abonnement;
                if ($abonnement && $abonnement->statut_paiement !== 'valide') {
                    $abonnement->update([
                        'statut_paiement' => 'valide',
                        'statut' => 'actif',
                        'est_actif' => true,
                        'date_paiement' => now(),
                        'numero_transaction' => $transaction->transaction_id,
                    ]);

                    // Activer l'utilisateur
                    $user = $abonnement->restaurant->users()->where('role', 'admin')->first();
                    if ($user) {
                        $user->update(['is_active' => true]);
                    }
                }
            });
        }
    }
}
