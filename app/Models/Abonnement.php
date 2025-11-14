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
        'date_debut',
        'date_fin',
        'est_actif',
        'statut',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant_mensuel' => 'decimal:2',
            'date_debut' => 'date',
            'date_fin' => 'date',
            'est_actif' => 'boolean',
        ];
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
