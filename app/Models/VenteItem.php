<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'vente_id',
        'produit_id',
        'unite',
        'quantite',
        'prix_unitaire_fc',
        'prix_unitaire_usd',
        'sous_total_fc',
        'sous_total_usd',
        'benefice_fc',
        'benefice_usd',
    ];

    protected function casts(): array
    {
        return [
            'quantite' => 'integer',
            'prix_unitaire_fc' => 'decimal:2',
            'prix_unitaire_usd' => 'decimal:2',
            'sous_total_fc' => 'decimal:2',
            'sous_total_usd' => 'decimal:2',
            'benefice_fc' => 'decimal:2',
            'benefice_usd' => 'decimal:2',
        ];
    }

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }
}
