<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Abonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'plan',
        'montant_mensuel',
        'mode_paiement',
        'numero_transaction',
        'date_paiement',
        'date_debut',
        'date_fin',
        'est_actif',
        'statut',
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
            'est_actif' => 'boolean',
            'limitations' => 'array',
        ];
    }

    /**
     * Obtenir les limitations du plan
     */
    public function getLimitations(): array
    {
        if ($this->limitations) {
            return $this->limitations;
        }

        // Si pas de limitations stockées, récupérer depuis les plans prédéfinis
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

    public function isActive(): bool
    {
        return $this->est_actif
            && $this->statut === 'actif'
            && ($this->date_fin === null || $this->date_fin >= now());
    }
}
