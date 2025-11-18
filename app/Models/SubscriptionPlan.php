<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'montant_mensuel',
        'limitations',
        'est_actif',
    ];

    protected function casts(): array
    {
        return [
            'montant_mensuel' => 'decimal:2',
            'limitations' => 'array',
            'est_actif' => 'boolean',
        ];
    }

    /**
     * Plans d'abonnement prédéfinis
     */
    public static function getPlans(): array
    {
        return [
            'simple' => [
                'name' => 'Simple',
                'slug' => 'simple',
                'description' => 'Accès limité aux fonctionnalités de base',
                'montant_mensuel' => 50000, // 50 000 FC
                'limitations' => [
                    'max_users' => 2,
                    'max_produits' => 50,
                    'max_ventes_mois' => 500,
                    'rapports' => false,
                    'impression' => true,
                    'personnalisation' => false,
                    'support' => 'email',
                ],
            ],
            'medium' => [
                'name' => 'Medium',
                'slug' => 'medium',
                'description' => 'Accès plus poussé avec fonctionnalités avancées',
                'montant_mensuel' => 100000, // 100 000 FC
                'limitations' => [
                    'max_users' => 5,
                    'max_produits' => 200,
                    'max_ventes_mois' => 2000,
                    'rapports' => true,
                    'impression' => true,
                    'personnalisation' => true,
                    'support' => 'email_phone',
                ],
            ],
            'premium' => [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Accès total à toutes les fonctionnalités',
                'montant_mensuel' => 200000, // 200 000 FC
                'limitations' => [
                    'max_users' => null, // Illimité
                    'max_produits' => null, // Illimité
                    'max_ventes_mois' => null, // Illimité
                    'rapports' => true,
                    'impression' => true,
                    'personnalisation' => true,
                    'support' => 'prioritaire',
                ],
            ],
        ];
    }

    /**
     * Obtenir un plan par son slug
     */
    public static function getPlanBySlug(string $slug): ?array
    {
        $plans = self::getPlans();

        return $plans[$slug] ?? null;
    }
}
