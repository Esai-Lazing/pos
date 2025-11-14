<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'restaurant_id',
        'nom',
        'code',
        'description',
        'categorie',
        'unite_mesure',
        'bouteilles_par_casier',
        'quantite_casiers',
        'quantite_bouteilles',
        'quantite_verres',
        'stock_minimum',
        'prix_casier_fc',
        'prix_casier_usd',
        'prix_bouteille_fc',
        'prix_bouteille_usd',
        'prix_verre_fc',
        'prix_verre_usd',
        'est_actif',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'bouteilles_par_casier' => 'integer',
            'quantite_casiers' => 'integer',
            'quantite_bouteilles' => 'integer',
            'quantite_verres' => 'integer',
            'stock_minimum' => 'integer',
            'prix_casier_fc' => 'decimal:2',
            'prix_casier_usd' => 'decimal:2',
            'prix_bouteille_fc' => 'decimal:2',
            'prix_bouteille_usd' => 'decimal:2',
            'prix_verre_fc' => 'decimal:2',
            'prix_verre_usd' => 'decimal:2',
            'est_actif' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($produit) {
            // Générer automatiquement le code si non fourni
            if (empty($produit->code)) {
                $produit->code = static::genererCodeUnique($produit->nom);
            }
        });
    }

    /**
     * Génère un code unique basé sur le nom du produit
     */
    public static function genererCodeUnique(string $nom): string
    {
        // Extraire les initiales (mots de 2+ caractères)
        $mots = preg_split('/\s+/', strtoupper(trim($nom)));
        $initiales = '';
        
        foreach ($mots as $mot) {
            if (strlen($mot) >= 2) {
                $initiales .= substr($mot, 0, 2);
            } elseif (strlen($mot) === 1) {
                $initiales .= $mot;
            }
        }

        // Limiter à 6 caractères pour les initiales
        $base = substr($initiales, 0, 6);
        
        // Si pas assez de caractères, compléter avec des lettres
        if (strlen($base) < 3) {
            $base = str_pad($base, 3, 'X', STR_PAD_RIGHT);
        }

        // Chercher un code unique en ajoutant un numéro incrémental
        $code = $base;
        $compteur = 1;
        
        while (static::where('code', $code)->exists()) {
            // Format: BASExxx où xxx est un numéro sur 3 chiffres
            $suffixe = str_pad((string) $compteur, 3, '0', STR_PAD_LEFT);
            $code = substr($base, 0, 3).$suffixe;
            $compteur++;
            
            // Sécurité: éviter une boucle infinie
            if ($compteur > 9999) {
                // Utiliser un timestamp si trop de collisions
                $code = $base.mt_rand(1000, 9999);
                break;
            }
        }

        return $code;
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function venteItems(): HasMany
    {
        return $this->hasMany(VenteItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getStockTotalBouteillesAttribute(): int
    {
        return ($this->quantite_casiers * $this->bouteilles_par_casier) + $this->quantite_bouteilles;
    }

    public function getStockDisponibleAttribute(): bool
    {
        return $this->stock_total_bouteilles > 0;
    }

    public function getStockBasAttribute(): bool
    {
        // Stock minimum est en casiers, convertir en bouteilles pour comparaison
        $stockMinimumBouteilles = $this->stock_minimum * $this->bouteilles_par_casier;
        return $this->stock_total_bouteilles <= $stockMinimumBouteilles;
    }

    public function retirerStock(string $unite, int $quantite): bool
    {
        $bouteillesARetirer = match ($unite) {
            'casier' => $quantite * $this->bouteilles_par_casier,
            'bouteille' => $quantite,
            'verre' => $quantite,
            default => 0,
        };

        if ($bouteillesARetirer > $this->stock_total_bouteilles) {
            return false;
        }

        $bouteillesRestantes = $this->stock_total_bouteilles - $bouteillesARetirer;
        $this->quantite_casiers = intval($bouteillesRestantes / $this->bouteilles_par_casier);
        $this->quantite_bouteilles = $bouteillesRestantes % $this->bouteilles_par_casier;

        return $this->save();
    }

    public function ajouterStock(string $unite, int $quantite): bool
    {
        $bouteillesAAjouter = match ($unite) {
            'casier' => $quantite * $this->bouteilles_par_casier,
            'bouteille' => $quantite,
            'verre' => $quantite,
            default => 0,
        };

        $totalBouteilles = $this->stock_total_bouteilles + $bouteillesAAjouter;
        $this->quantite_casiers = intval($totalBouteilles / $this->bouteilles_par_casier);
        $this->quantite_bouteilles = $totalBouteilles % $this->bouteilles_par_casier;

        return $this->save();
    }
}
