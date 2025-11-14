<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'produit_id',
        'user_id',
        'type',
        'unite',
        'quantite_casiers',
        'quantite_bouteilles',
        'quantite_verres',
        'quantite_totale_bouteilles',
        'prix_achat_fc',
        'prix_achat_usd',
        'raison',
        'reference_fournisseur',
        'date_mouvement',
    ];

    protected function casts(): array
    {
        return [
            'quantite_casiers' => 'integer',
            'quantite_bouteilles' => 'integer',
            'quantite_verres' => 'integer',
            'quantite_totale_bouteilles' => 'integer',
            'prix_achat_fc' => 'decimal:2',
            'prix_achat_usd' => 'decimal:2',
            'date_mouvement' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($movement) {
            if (empty($movement->date_mouvement)) {
                $movement->date_mouvement = now();
            }

            // Calculer la quantité totale en bouteilles
            $produit = Produit::find($movement->produit_id);
            if ($produit) {
                $bouteillesParCasier = $produit->bouteilles_par_casier;
                $movement->quantite_totale_bouteilles = 
                    ($movement->quantite_casiers * $bouteillesParCasier) + 
                    $movement->quantite_bouteilles + 
                    $movement->quantite_verres;
            }
        });
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
