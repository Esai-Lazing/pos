<?php

namespace App\Services;

use App\Models\Abonnement;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MobileMoneyService
{
    private string $provider;

    public function __construct()
    {
        $this->provider = config('services.mobile_money.provider', 'orange_money');
    }

    /**
     * Initier un paiement Mobile Money
     */
    public function initiatePayment(Abonnement $abonnement, string $phoneNumber, ?string $provider = null): array
    {
        $provider = $provider ?? $this->provider;

        return match ($provider) {
            'airtel_money' => $this->initiateAirtelMoneyPayment($abonnement, $phoneNumber),
            'orange_money' => $this->initiateOrangeMoneyPayment($abonnement, $phoneNumber),
            default => ['success' => false, 'error' => 'Provider non supporté'],
        };
    }

    /**
     * Vérifier le statut d'un paiement Mobile Money
     */
    public function verifyPayment(string $transactionId, ?string $provider = null): array
    {
        $provider = $provider ?? $this->provider;

        return match ($provider) {
            'airtel_money' => $this->verifyAirtelMoneyPayment($transactionId),
            'orange_money' => $this->verifyOrangeMoneyPayment($transactionId),
            default => ['success' => false, 'error' => 'Provider non supporté'],
        };
    }

    /**
     * Confirmer un paiement avec OTP/PIN
     */
    public function confirmPayment(Abonnement $abonnement, string $otpCode, ?string $provider = null): array
    {
        $provider = $provider ?? $this->provider;

        return match ($provider) {
            'airtel_money' => $this->confirmAirtelMoneyPayment($abonnement, $otpCode),
            'orange_money' => $this->confirmOrangeMoneyPayment($abonnement, $otpCode),
            default => ['success' => false, 'error' => 'Provider non supporté'],
        };
    }

    /**
     * Airtel Money - Initier un paiement
     */
    private function initiateAirtelMoneyPayment(Abonnement $abonnement, string $phoneNumber): array
    {
        try {
            $config = config('services.mobile_money.airtel_money');
            $clientId = $config['client_id'] ?? null;
            $clientSecret = $config['client_secret'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://openapiuat.airtel.africa';
            $country = $config['country'] ?? 'CD';
            $currency = $config['currency'] ?? 'USD';

            if (! $clientId || ! $clientSecret) {
                return ['success' => false, 'error' => 'Configuration Airtel Money manquante'];
            }

            // Normaliser le numéro de téléphone (format international)
            $phoneNumber = $this->normalizePhoneNumber($phoneNumber, 'airtel');

            // Générer un ID de transaction unique
            $transactionId = 'ATL-'.time().'-'.strtoupper(Str::random(8));

            // Obtenir le token d'accès
            $accessToken = $this->getAirtelMoneyAccessToken($clientId, $clientSecret, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès Airtel Money'];
            }

            // Créer la transaction en base
            $transaction = PaymentTransaction::create([
                'abonnement_id' => $abonnement->id,
                'transaction_id' => $transactionId,
                'provider' => 'airtel_money',
                'type' => 'mobile_money',
                'amount' => $abonnement->montant_mensuel,
                'currency' => $currency,
                'status' => 'pending',
                'metadata' => [
                    'phone' => $phoneNumber,
                    'provider' => 'airtel_money',
                    'country' => $country,
                ],
                'customer_phone' => $phoneNumber,
            ]);

            // Convertir le montant en centimes (Airtel Money utilise les centimes)
            $amountInCents = (int) ($abonnement->montant_mensuel * 100);

            // Initier le paiement via l'API Airtel Money (API standard)
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
                'X-Country' => $country,
                'X-Currency' => $currency,
            ])->post("{$apiUrl}/standard/v1/payments", [
                'payee' => [
                    'msisdn' => $phoneNumber,
                ],
                'reference' => $transactionId,
                'transaction' => [
                    'amount' => (string) $amountInCents,
                    'id' => $transactionId,
                ],
                'pin' => false, // L'utilisateur entrera son PIN via l'API
            ]);

            $responseData = $response->json();

            if ($response->successful() && ($responseData['status']['success'] ?? false)) {
                $apiTransactionId = $responseData['data']['transaction']['id'] ?? $transactionId;

                // Mettre à jour la transaction avec les données de l'API
                $transaction->update([
                    'transaction_id' => $apiTransactionId,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'airtel_response' => $responseData,
                        'status_code' => $responseData['status']['code'] ?? null,
                        'status_message' => $responseData['status']['message'] ?? null,
                        'initiated_at' => now()->toIso8601String(),
                    ]),
                ]);

                // Générer un OTP local pour confirmation
                $otp = $abonnement->generateOtp();

                return [
                    'success' => true,
                    'transaction_id' => $apiTransactionId,
                    'otp' => $otp,
                    'message' => 'Une demande de paiement a été envoyée à votre numéro Airtel Money. Entrez votre PIN pour confirmer.',
                    'requires_otp' => true,
                    'requires_pin' => true,
                    'api_response' => $responseData,
                ];
            }

            $errorMessage = $responseData['status']['message'] ?? $responseData['message'] ?? 'Erreur lors de l\'initiation du paiement';
            $errorCode = $responseData['status']['code'] ?? $response->status();

            Log::error('Airtel Money payment error', [
                'response' => $responseData,
                'status' => $response->status(),
                'error_code' => $errorCode,
                'transaction_id' => $transactionId,
            ]);

            // Marquer la transaction comme échouée
            $transaction->update([
                'status' => 'failed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'error' => $errorMessage,
                    'error_code' => $errorCode,
                ]),
            ]);

            return [
                'success' => false,
                'error' => $errorMessage,
                'error_code' => $errorCode,
            ];
        } catch (\Exception $e) {
            Log::error('Airtel Money payment exception: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'phone' => $phoneNumber,
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de l\'initiation du paiement: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Airtel Money - Confirmer le paiement avec OTP
     */
    private function confirmAirtelMoneyPayment(Abonnement $abonnement, string $otpCode): array
    {
        try {
            $transaction = PaymentTransaction::where('abonnement_id', $abonnement->id)
                ->where('provider', 'airtel_money')
                ->where('status', 'pending')
                ->latest()
                ->first();

            if (! $transaction) {
                return ['success' => false, 'error' => 'Transaction non trouvée'];
            }

            $config = config('services.mobile_money.airtel_money');
            $clientId = $config['client_id'] ?? null;
            $clientSecret = $config['client_secret'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://openapiuat.airtel.africa';

            // Obtenir le token d'accès
            $accessToken = $this->getAirtelMoneyAccessToken($clientId, $clientSecret, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès'];
            }

            // Vérifier le statut de la transaction
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
                'X-Country' => $config['country'] ?? 'CD',
                'X-Currency' => 'USD',
            ])->get("{$apiUrl}/standard/v1/payments/{$transaction->transaction_id}");

            if ($response->successful()) {
                $responseData = $response->json();
                $status = $responseData['data']['transaction']['status'] ?? null;

                if ($status === 'TS') { // TS = Transaction Successful
                    // Mettre à jour la transaction
                    $transaction->update([
                        'status' => 'completed',
                        'processed_at' => now(),
                        'metadata' => array_merge($transaction->metadata ?? [], [
                            'confirmation_response' => $responseData,
                        ]),
                    ]);

                    // Activer l'abonnement
                    $this->activateSubscription($abonnement, $transaction);

                    return [
                        'success' => true,
                        'message' => 'Paiement confirmé avec succès',
                    ];
                }

                return [
                    'success' => false,
                    'error' => 'Le paiement n\'a pas encore été confirmé. Veuillez vérifier votre compte Airtel Money.',
                ];
            }

            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification du paiement',
            ];
        } catch (\Exception $e) {
            Log::error('Airtel Money confirmation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Erreur lors de la confirmation: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Airtel Money - Vérifier le statut d'un paiement
     */
    private function verifyAirtelMoneyPayment(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

            if (! $transaction) {
                return ['success' => false, 'error' => 'Transaction non trouvée'];
            }

            $config = config('services.mobile_money.airtel_money');
            $clientId = $config['client_id'] ?? null;
            $clientSecret = $config['client_secret'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://openapiuat.airtel.africa';

            $accessToken = $this->getAirtelMoneyAccessToken($clientId, $clientSecret, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès'];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
                'X-Country' => $config['country'] ?? 'CD',
                'X-Currency' => 'USD',
            ])->get("{$apiUrl}/standard/v1/payments/{$transactionId}");

            if ($response->successful()) {
                $responseData = $response->json();
                $status = $responseData['data']['transaction']['status'] ?? null;

                $isCompleted = $status === 'TS';

                if ($isCompleted && $transaction->status !== 'completed') {
                    $transaction->update([
                        'status' => 'completed',
                        'processed_at' => now(),
                    ]);

                    $abonnement = $transaction->abonnement;
                    if ($abonnement && $abonnement->statut_paiement !== 'valide') {
                        $this->activateSubscription($abonnement, $transaction);
                    }
                }

                return [
                    'success' => $isCompleted,
                    'status' => $status,
                    'transaction' => $responseData,
                ];
            }

            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification',
            ];
        } catch (\Exception $e) {
            Log::error('Airtel Money verify error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Orange Money - Initier un paiement
     */
    private function initiateOrangeMoneyPayment(Abonnement $abonnement, string $phoneNumber): array
    {
        try {
            $config = config('services.mobile_money.orange_money');
            $merchantId = $config['merchant_id'] ?? null;
            $apiKey = $config['api_key'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://api.orange.com';
            $currency = $config['currency'] ?? 'USD';

            if (! $merchantId || ! $apiKey) {
                return ['success' => false, 'error' => 'Configuration Orange Money manquante'];
            }

            // Normaliser le numéro de téléphone
            $phoneNumber = $this->normalizePhoneNumber($phoneNumber, 'orange');

            // Générer un ID de transaction unique
            $transactionId = 'OM-'.time().'-'.strtoupper(Str::random(8));

            // Créer la transaction en base
            $transaction = PaymentTransaction::create([
                'abonnement_id' => $abonnement->id,
                'transaction_id' => $transactionId,
                'provider' => 'orange_money',
                'type' => 'mobile_money',
                'amount' => $abonnement->montant_mensuel,
                'currency' => $currency,
                'status' => 'pending',
                'metadata' => [
                    'phone' => $phoneNumber,
                    'provider' => 'orange_money',
                ],
                'customer_phone' => $phoneNumber,
            ]);

            // Obtenir le token d'accès OAuth2
            $accessToken = $this->getOrangeMoneyAccessToken($apiKey, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès Orange Money'];
            }

            // URLs de callback
            $returnUrl = route('payment.mobile-money.callback', [
                'provider' => 'orange_money',
                'transaction_id' => $transactionId,
            ]);
            $cancelUrl = route('payment.cancel');
            $notifUrl = route('webhooks.mobile-money', ['provider' => 'orange_money']);

            // Initier le paiement via l'API Orange Money Web Payment
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$apiUrl}/orange-money-webpay/dev/v1/webpayment", [
                'merchant_key' => $merchantId,
                'currency' => $currency,
                'order_id' => $transactionId,
                'amount' => $abonnement->montant_mensuel,
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'notif_url' => $notifUrl,
                'lang' => 'fr',
                'reference' => 'Abonnement '.$abonnement->plan,
            ]);

            $responseData = $response->json();

            if ($response->successful() && isset($responseData['pay_token'])) {
                $payToken = $responseData['pay_token'];
                $paymentUrl = $responseData['payment_url'] ?? null;

                // Mettre à jour la transaction
                $transaction->update([
                    'transaction_id' => $payToken,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'orange_response' => $responseData,
                        'payment_url' => $paymentUrl,
                        'order_id' => $transactionId,
                        'initiated_at' => now()->toIso8601String(),
                    ]),
                ]);

                // Générer un OTP local pour confirmation
                $otp = $abonnement->generateOtp();

                return [
                    'success' => true,
                    'transaction_id' => $payToken,
                    'order_id' => $transactionId,
                    'otp' => $otp,
                    'message' => 'Redirigez-vous vers la page de paiement Orange Money pour compléter votre transaction.',
                    'requires_otp' => true,
                    'payment_url' => $paymentUrl,
                    'api_response' => $responseData,
                ];
            }

            $errorMessage = $responseData['message'] ?? $responseData['error_description'] ?? 'Erreur lors de l\'initiation du paiement';
            $errorCode = $responseData['error'] ?? $response->status();

            Log::error('Orange Money payment error', [
                'response' => $responseData,
                'status' => $response->status(),
                'error_code' => $errorCode,
                'transaction_id' => $transactionId,
            ]);

            // Marquer la transaction comme échouée
            $transaction->update([
                'status' => 'failed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'error' => $errorMessage,
                    'error_code' => $errorCode,
                ]),
            ]);

            return [
                'success' => false,
                'error' => $errorMessage,
                'error_code' => $errorCode,
            ];
        } catch (\Exception $e) {
            Log::error('Orange Money payment exception: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'phone' => $phoneNumber,
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de l\'initiation du paiement: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Orange Money - Confirmer le paiement avec OTP
     */
    private function confirmOrangeMoneyPayment(Abonnement $abonnement, string $otpCode): array
    {
        try {
            $transaction = PaymentTransaction::where('abonnement_id', $abonnement->id)
                ->where('provider', 'orange_money')
                ->where('status', 'pending')
                ->latest()
                ->first();

            if (! $transaction) {
                return ['success' => false, 'error' => 'Transaction non trouvée'];
            }

            $config = config('services.mobile_money.orange_money');
            $apiKey = $config['api_key'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://api.orange.com';

            // Obtenir le token d'accès
            $accessToken = $this->getOrangeMoneyAccessToken($apiKey, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès'];
            }

            // Vérifier le statut de la transaction
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
            ])->get("{$apiUrl}/orange-money-webpay/dev/v1/transactionstatus", [
                'order_id' => $transaction->transaction_id,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $status = $responseData['status'] ?? null;

                if ($status === 'SUCCESS' || $status === 'SUCCESSFUL') {
                    // Mettre à jour la transaction
                    $transaction->update([
                        'status' => 'completed',
                        'processed_at' => now(),
                        'metadata' => array_merge($transaction->metadata ?? [], [
                            'confirmation_response' => $responseData,
                        ]),
                    ]);

                    // Activer l'abonnement
                    $this->activateSubscription($abonnement, $transaction);

                    return [
                        'success' => true,
                        'message' => 'Paiement confirmé avec succès',
                    ];
                }

                return [
                    'success' => false,
                    'error' => 'Le paiement n\'a pas encore été confirmé. Veuillez vérifier votre compte Orange Money.',
                ];
            }

            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification du paiement',
            ];
        } catch (\Exception $e) {
            Log::error('Orange Money confirmation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Erreur lors de la confirmation: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Orange Money - Vérifier le statut d'un paiement
     */
    private function verifyOrangeMoneyPayment(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

            if (! $transaction) {
                return ['success' => false, 'error' => 'Transaction non trouvée'];
            }

            $config = config('services.mobile_money.orange_money');
            $apiKey = $config['api_key'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://api.orange.com';

            $accessToken = $this->getOrangeMoneyAccessToken($apiKey, $apiUrl);

            if (! $accessToken) {
                return ['success' => false, 'error' => 'Impossible d\'obtenir le token d\'accès'];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
            ])->get("{$apiUrl}/orange-money-webpay/dev/v1/transactionstatus", [
                'order_id' => $transactionId,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $status = $responseData['status'] ?? null;

                $isCompleted = in_array($status, ['SUCCESS', 'SUCCESSFUL']);

                if ($isCompleted && $transaction->status !== 'completed') {
                    $transaction->update([
                        'status' => 'completed',
                        'processed_at' => now(),
                    ]);

                    $abonnement = $transaction->abonnement;
                    if ($abonnement && $abonnement->statut_paiement !== 'valide') {
                        $this->activateSubscription($abonnement, $transaction);
                    }
                }

                return [
                    'success' => $isCompleted,
                    'status' => $status,
                    'transaction' => $responseData,
                ];
            }

            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification',
            ];
        } catch (\Exception $e) {
            Log::error('Orange Money verify error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Obtenir le token d'accès Airtel Money
     */
    private function getAirtelMoneyAccessToken(string $clientId, string $clientSecret, string $apiUrl): ?string
    {
        try {
            $response = Http::asForm()->post("{$apiUrl}/auth/oauth2/token", [
                'grant_type' => 'client_credentials',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['access_token'] ?? null;
            }

            Log::error('Airtel Money token error', ['response' => $response->json()]);

            return null;
        } catch (\Exception $e) {
            Log::error('Airtel Money token exception: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Obtenir le token d'accès Orange Money
     */
    private function getOrangeMoneyAccessToken(string $apiKey, string $apiUrl): ?string
    {
        try {
            $authHeader = base64_encode($apiKey.':');

            $response = Http::withHeaders([
                'Authorization' => 'Basic '.$authHeader,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->asForm()->post("{$apiUrl}/oauth/v3/token", [
                'grant_type' => 'client_credentials',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['access_token'] ?? null;
            }

            Log::error('Orange Money token error', ['response' => $response->json()]);

            return null;
        } catch (\Exception $e) {
            Log::error('Orange Money token exception: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Normaliser le numéro de téléphone
     */
    private function normalizePhoneNumber(string $phoneNumber, string $provider): string
    {
        // Supprimer les espaces et caractères spéciaux
        $phoneNumber = preg_replace('/[^0-9+]/', '', $phoneNumber);

        // Si le numéro commence par 0, remplacer par l'indicatif du pays
        if (str_starts_with($phoneNumber, '0')) {
            $phoneNumber = '243'.substr($phoneNumber, 1); // RDC par défaut
        }

        // Si le numéro ne commence pas par +, l'ajouter
        if (! str_starts_with($phoneNumber, '+')) {
            if (! str_starts_with($phoneNumber, '243')) {
                $phoneNumber = '243'.$phoneNumber;
            }
            $phoneNumber = '+'.$phoneNumber;
        }

        return $phoneNumber;
    }

    /**
     * Activer l'abonnement après paiement réussi
     */
    private function activateSubscription(Abonnement $abonnement, PaymentTransaction $transaction): void
    {
        \DB::transaction(function () use ($abonnement, $transaction) {
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
        });
    }
}
