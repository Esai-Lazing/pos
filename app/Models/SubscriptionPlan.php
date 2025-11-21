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
                'name' => 'Starter',
                'slug' => 'simple',
                'description' => 'Solution idéale pour les petits établissements qui démarrent',
                'montant_mensuel' => 25.00, // 25 USD (environ 50 000 FC)
                'limitations' => [
                    'max_users' => 4, // admin, gérant, caisse, stock
                    'max_serveurs' => 5,
                    'max_produits' => 50,
                    'max_ventes_mois' => 500,
                    'rapports' => true,
                    'impression' => true,
                    'personnalisation' => false,
                    'support' => 'email',
                ],
            ],
            'medium' => [
                'name' => 'Business',
                'slug' => 'medium',
                'description' => 'Parfait pour les établissements en croissance avec des besoins avancés',
                'montant_mensuel' => 50.00, // 50 USD (environ 100 000 FC)
                'limitations' => [
                    'max_users' => 10,
                    'max_serveurs' => 20,
                    'max_produits' => 200,
                    'max_ventes_mois' => 2000,
                    'rapports' => true,
                    'impression' => true,
                    'personnalisation' => true,
                    'support' => 'email_phone',
                ],
            ],
            'premium' => [
                'name' => 'Pro',
                'slug' => 'premium',
                'description' => 'Solution complète pour les grandes entreprises sans limites',
                'montant_mensuel' => 100.00, // 100 USD (environ 200 000 FC)
                'limitations' => [
                    'max_users' => null, // Illimité
                    'max_serveurs' => null, // Illimité
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
