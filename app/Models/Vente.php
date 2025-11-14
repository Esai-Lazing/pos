<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Vente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_facture',
        'restaurant_id',
        'user_id',
        'montant_total_fc',
        'montant_total_usd',
        'montant_paye_fc',
        'montant_paye_usd',
        'rendu_fc',
        'rendu_usd',
        'mode_paiement',
        'taux_change',
        'est_imprime',
        'imprime_at',
        'est_synchronise',
        'donnees_offline',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant_total_fc' => 'decimal:2',
            'montant_total_usd' => 'decimal:2',
            'montant_paye_fc' => 'decimal:2',
            'montant_paye_usd' => 'decimal:2',
            'rendu_fc' => 'decimal:2',
            'rendu_usd' => 'decimal:2',
            'taux_change' => 'decimal:4',
            'est_imprime' => 'boolean',
            'imprime_at' => 'datetime',
            'est_synchronise' => 'boolean',
            'donnees_offline' => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($vente) {
            if (empty($vente->numero_facture)) {
                $vente->numero_facture = 'FACT-'.date('Ymd').'-'.Str::upper(Str::random(6));
            }
        });
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(VenteItem::class);
    }

    public function marquerCommeImprime(): bool
    {
        $this->est_imprime = true;
        $this->imprime_at = now();

        return $this->save();
    }
}
