<?php

namespace App\Services;

use App\Models\Abonnement;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeService
{
    private ?StripeClient $stripe = null;

    /**
     * Obtenir l'instance StripeClient
     */
    private function getStripeClient(): StripeClient
    {
        if ($this->stripe === null) {
            $secretKey = config('services.stripe.secret');

            if (empty($secretKey)) {
                throw new \RuntimeException('Stripe secret key is not configured. Please set STRIPE_SECRET in your .env file.');
            }

            $this->stripe = new StripeClient($secretKey);
        }

        return $this->stripe;
    }

    /**
     * Créer une session de paiement Stripe
     */
    public function createCheckoutSession(Abonnement $abonnement, string $successUrl, string $cancelUrl): array
    {
        try {
            $stripe = $this->getStripeClient();
            $session = $stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Abonnement '.ucfirst($abonnement->plan),
                            'description' => 'Abonnement mensuel - Plan '.ucfirst($abonnement->plan),
                        ],
                        'unit_amount' => (int) ($abonnement->montant_mensuel * 100), // Convertir en cents
                        'recurring' => [
                            'interval' => 'month',
                        ],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'customer_email' => $abonnement->restaurant->email,
                'metadata' => [
                    'abonnement_id' => $abonnement->id,
                    'restaurant_id' => $abonnement->restaurant_id,
                ],
            ]);

            return [
                'success' => true,
                'session_id' => $session->id,
                'url' => $session->url,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Créer un paiement unique (one-time payment)
     */
    public function createPaymentIntent(Abonnement $abonnement, string $paymentMethodId): array
    {
        try {
            $stripe = $this->getStripeClient();
            $intent = $stripe->paymentIntents->create([
                'amount' => (int) ($abonnement->montant_mensuel * 100),
                'currency' => 'usd',
                'payment_method' => $paymentMethodId,
                'confirmation_method' => 'manual',
                'confirm' => true,
                'metadata' => [
                    'abonnement_id' => $abonnement->id,
                    'restaurant_id' => $abonnement->restaurant_id,
                ],
            ]);

            // Créer la transaction
            PaymentTransaction::create([
                'abonnement_id' => $abonnement->id,
                'transaction_id' => $intent->id,
                'provider' => 'stripe',
                'payment_method' => 'carte_bancaire',
                'amount' => $abonnement->montant_mensuel,
                'currency' => 'USD',
                'status' => $intent->status === 'succeeded' ? 'completed' : 'pending',
                'metadata' => $intent->toArray(),
                'customer_email' => $abonnement->restaurant->email,
            ]);

            return [
                'success' => $intent->status === 'succeeded',
                'payment_intent_id' => $intent->id,
                'status' => $intent->status,
                'requires_action' => $intent->status === 'requires_action',
                'client_secret' => $intent->client_secret,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment intent error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier le statut d'un paiement
     */
    public function verifyPayment(string $paymentIntentId): array
    {
        try {
            $stripe = $this->getStripeClient();
            $intent = $stripe->paymentIntents->retrieve($paymentIntentId);

            $transaction = PaymentTransaction::where('transaction_id', $paymentIntentId)->first();
            if ($transaction) {
                $transaction->update([
                    'status' => $intent->status === 'succeeded' ? 'completed' : 'pending',
                    'processed_at' => $intent->status === 'succeeded' ? now() : null,
                ]);
            }

            return [
                'success' => $intent->status === 'succeeded',
                'status' => $intent->status,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe verify payment error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Gérer un webhook Stripe
     */
    public function handleWebhook(array $payload): void
    {
        $eventType = $payload['type'] ?? null;

        switch ($eventType) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($payload['data']['object']);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($payload['data']['object']);
                break;

            case 'checkout.session.completed':
                $this->handleCheckoutCompleted($payload['data']['object']);
                break;
        }
    }

    private function handlePaymentSucceeded(array $paymentIntent): void
    {
        $abonnementId = $paymentIntent['metadata']['abonnement_id'] ?? null;
        if (! $abonnementId) {
            return;
        }

        $abonnement = Abonnement::find($abonnementId);
        if (! $abonnement) {
            return;
        }

        // Mettre à jour la transaction
        $transaction = PaymentTransaction::where('transaction_id', $paymentIntent['id'])->first();
        if ($transaction) {
            $transaction->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);
        }

        // Activer l'abonnement
        $abonnement->update([
            'statut_paiement' => 'valide',
            'statut' => 'actif',
            'est_actif' => true,
            'date_paiement' => now(),
            'numero_transaction' => $paymentIntent['id'],
        ]);

        // Activer l'utilisateur
        $user = $abonnement->restaurant->users()->where('role', 'admin')->first();
        if ($user) {
            $user->update(['is_active' => true]);
        }
    }

    private function handlePaymentFailed(array $paymentIntent): void
    {
        $transaction = PaymentTransaction::where('transaction_id', $paymentIntent['id'])->first();
        if ($transaction) {
            $transaction->update([
                'status' => 'failed',
                'failure_reason' => $paymentIntent['last_payment_error']['message'] ?? 'Payment failed',
            ]);
        }
    }

    private function handleCheckoutCompleted(array $session): void
    {
        $abonnementId = $session['metadata']['abonnement_id'] ?? null;
        if (! $abonnementId) {
            return;
        }

        $abonnement = Abonnement::find($abonnementId);
        if (! $abonnement) {
            return;
        }

        // Créer la transaction
        PaymentTransaction::create([
            'abonnement_id' => $abonnement->id,
            'transaction_id' => $session['id'],
            'provider' => 'stripe',
            'payment_method' => 'carte_bancaire',
            'amount' => $abonnement->montant_mensuel,
            'currency' => 'USD',
            'status' => 'completed',
            'metadata' => $session,
            'customer_email' => $session['customer_email'] ?? $abonnement->restaurant->email,
            'processed_at' => now(),
        ]);

        // Activer l'abonnement
        $abonnement->update([
            'statut_paiement' => 'valide',
            'statut' => 'actif',
            'est_actif' => true,
            'date_paiement' => now(),
            'numero_transaction' => $session['payment_intent'] ?? $session['id'],
        ]);

        // Activer l'utilisateur
        $user = $abonnement->restaurant->users()->where('role', 'admin')->first();
        if ($user) {
            $user->update(['is_active' => true]);
        }
    }
}
