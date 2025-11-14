<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom',
        'slug',
        'email',
        'telephone',
        'est_actif',
        'date_creation',
    ];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
            'date_creation' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($restaurant) {
            // Si le slug n'est pas fourni, le générer automatiquement
            // Sinon, le slug est déjà fourni par le contrôleur (avec vérification d'unicité)
            if (empty($restaurant->slug)) {
                $restaurant->slug = static::genererSlugUnique($restaurant->nom);
            }
        });

        static::updating(function ($restaurant) {
            // Si le nom change, régénérer le slug (en excluant l'ID actuel)
            if ($restaurant->isDirty('nom')) {
                $restaurant->slug = static::genererSlugUnique($restaurant->nom, $restaurant->id);
            } elseif ($restaurant->isDirty('slug')) {
                // Vérifier que le nouveau slug est unique (en excluant l'ID actuel)
                $restaurant->slug = static::assurerSlugUnique($restaurant->slug, $restaurant->id);
            }
        });
    }

    /**
     * Génère un slug unique basé sur le nom du restaurant
     */
    public static function genererSlugUnique(string $nom, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($nom);
        return static::assurerSlugUnique($baseSlug, $excludeId);
    }

    /**
     * Assure qu'un slug est unique en ajoutant un suffixe numérique si nécessaire
     * 
     * Important: On vérifie directement dans la base de données pour inclure
     * les enregistrements supprimés, car la contrainte unique s'applique aussi à eux
     */
    public static function assurerSlugUnique(string $slug, ?int $excludeId = null): string
    {
        $uniqueSlug = $slug;
        $compteur = 1;
        $tableName = (new static)->getTable();

        // Vérifier directement dans la base de données (inclut les soft-deleted)
        // On utilise une requête SQL brute pour être sûr d'inclure tous les enregistrements
        $query = DB::table($tableName)->where('slug', $uniqueSlug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        // Tant que le slug existe dans la base de données, incrémenter
        while ($query->exists()) {
            $uniqueSlug = $slug.'-'.$compteur;
            $compteur++;

            // Reconstruire la requête pour le nouveau slug
            $query = DB::table($tableName)->where('slug', $uniqueSlug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            // Sécurité: éviter une boucle infinie
            if ($compteur > 10000) {
                // Utiliser un timestamp si trop de collisions
                $uniqueSlug = $slug.'-'.time();
                break;
            }
        }

        return $uniqueSlug;
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class);
    }

    public function ventes(): HasMany
    {
        return $this->hasMany(Vente::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function abonnement(): HasOne
    {
        return $this->hasOne(Abonnement::class)->where('est_actif', true)->latest();
    }

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }

    public function customization(): HasOne
    {
        return $this->hasOne(RestaurantCustomization::class);
    }

    public function hasActiveSubscription(): bool
    {
        return $this->abonnement()
            ->where('est_actif', true)
            ->where('statut', 'actif')
            ->where(function ($query) {
                $query->whereNull('date_fin')
                    ->orWhere('date_fin', '>=', now());
            })
            ->exists();
    }
}
