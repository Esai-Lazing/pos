<?php

namespace App\Services;

use App\Models\Abonnement;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private StripeService $stripeService,
        private MobileMoneyService $mobileMoneyService
    ) {}

    /**
     * Traiter un paiement selon le mode choisi
     */
    public function processPayment(Abonnement $abonnement, array $paymentData): array
    {
        return match ($abonnement->mode_paiement) {
            'carte_bancaire' => $this->processCreditCardPayment($abonnement, $paymentData),
            'mobile_money' => $this->processMobileMoneyPayment($abonnement, $paymentData),
            'espece' => $this->processCashPayment($abonnement),
            default => ['success' => false, 'error' => 'Mode de paiement non supporté'],
        };
    }

    /**
     * Paiement par carte bancaire
     */
    private function processCreditCardPayment(Abonnement $abonnement, array $paymentData): array
    {
        $paymentMethodId = $paymentData['payment_method_id'] ?? null;

        if (! $paymentMethodId) {
            return ['success' => false, 'error' => 'Méthode de paiement requise'];
        }

        return $this->stripeService->createPaymentIntent($abonnement, $paymentMethodId);
    }

    /**
     * Paiement Mobile Money
     */
    private function processMobileMoneyPayment(Abonnement $abonnement, array $paymentData): array
    {
        $phoneNumber = $paymentData['phone_number'] ?? null;
        $provider = $paymentData['provider'] ?? null;

        if (! $phoneNumber) {
            return ['success' => false, 'error' => 'Numéro de téléphone requis'];
        }

        return $this->mobileMoneyService->initiatePayment($abonnement, $phoneNumber, $provider);
    }

    /**
     * Paiement en espèce
     */
    private function processCashPayment(Abonnement $abonnement): array
    {
        // Pour le paiement en espèce, on crée juste une transaction en attente
        \App\Models\PaymentTransaction::create([
            'abonnement_id' => $abonnement->id,
            'transaction_id' => 'CASH-'.time().'-'.strtoupper(substr(md5($abonnement->id), 0, 8)),
            'provider' => 'espece',
            'payment_method' => 'espece',
            'amount' => $abonnement->montant_mensuel,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        return [
            'success' => true,
            'message' => 'Paiement en espèce enregistré. En attente de validation par un administrateur.',
        ];
    }

    /**
     * Générer une facture pour un abonnement
     */
    public function generateInvoice(Abonnement $abonnement): Invoice
    {
        return DB::transaction(function () use ($abonnement) {
            $amount = $abonnement->montant_mensuel;
            $taxAmount = $amount * 0.18; // 18% de TVA (à configurer)
            $totalAmount = $amount + $taxAmount;

            return Invoice::create([
                'abonnement_id' => $abonnement->id,
                'restaurant_id' => $abonnement->restaurant_id,
                'amount' => $amount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'currency' => 'USD',
                'status' => 'sent',
                'issue_date' => now(),
                'due_date' => now()->addDays(7),
                'line_items' => [
                    [
                        'description' => 'Abonnement '.ucfirst($abonnement->plan).' - '.now()->format('F Y'),
                        'quantity' => 1,
                        'unit_price' => $amount,
                        'total' => $amount,
                    ],
                ],
            ]);
        });
    }
}
