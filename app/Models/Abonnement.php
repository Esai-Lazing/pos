<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Abonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'plan',
        'montant_mensuel',
        'mode_paiement',
        'numero_transaction',
        'otp_code',
        'otp_expires_at',
        'date_paiement',
        'date_debut',
        'date_fin',
        'est_actif',
        'statut',
        'statut_paiement',
        'notes',
        'limitations',
    ];

    protected function casts(): array
    {
        return [
            'montant_mensuel' => 'decimal:2',
            'date_debut' => 'date',
            'date_fin' => 'date',
            'date_paiement' => 'datetime',
            'otp_expires_at' => 'datetime',
            'est_actif' => 'boolean',
            'limitations' => 'array',
        ];
    }

    /**
     * Obtenir les limitations du plan
     * Toujours utiliser les limitations du plan prédéfini pour garantir la cohérence
     */
    public function getLimitations(): array
    {

        // if ($this->limitations) {
        //     return $this->limitations;
        // }

        // Toujours récupérer depuis les plans prédéfinis pour garantir que les limitations sont à jour
        $plan = \App\Models\SubscriptionPlan::getPlanBySlug($this->plan);

        return $plan['limitations'] ?? [];
    }

    /**
     * Vérifier si une fonctionnalité est disponible
     */
    public function canAccess(string $feature): bool
    {
        $limitations = $this->getLimitations();

        return $limitations[$feature] ?? false;
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(\App\Models\PaymentTransaction::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(\App\Models\Invoice::class);
    }

    public function isActive(): bool
    {
        return $this->est_actif
            && $this->statut === 'actif'
            && $this->statut_paiement === 'valide'
            && ($this->date_fin === null || $this->date_fin >= now());
    }

    /**
     * Vérifier si le paiement est validé
     */
    public function isPaymentValidated(): bool
    {
        return $this->statut_paiement === 'valide';
    }

    /**
     * Générer un code OTP
     */
    public function generateOtp(): string
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10), // OTP valide 10 minutes
        ]);

        return $otp;
    }

    /**
     * Vérifier le code OTP
     */
    public function verifyOtp(string $code): bool
    {
        if ($this->otp_code === null || $this->otp_expires_at === null) {
            return false;
        }

        if ($this->otp_expires_at < now()) {
            return false;
        }

        return $this->otp_code === $code;
    }
}
