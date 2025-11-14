<?php

namespace Database\Factories;

use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Produit>
 */
class ProduitFactory extends Factory
{
    protected $model = Produit::class;

    public function definition(): array
    {
        $nom = fake()->randomElement([
            'Primus',
            'Heineken',
            'Tiger',
            'Coca-Cola',
            'Fanta',
            'Sprite',
            'Mutzig',
            'Turbo King',
            'Castel',
            '33 Export',
        ]);

        $prixBouteilleFc = fake()->numberBetween(1500, 5000);
        $prixCasierFc = $prixBouteilleFc * 24 * 0.9; // Réduction pour achat en casier
        $prixVerreFc = $prixBouteilleFc * 0.3; // Prix d'un verre

        return [
            'nom' => $nom,
            'code' => strtoupper(substr($nom, 0, 3)).fake()->numberBetween(100, 999),
            'description' => fake()->optional()->sentence(),
            'categorie' => fake()->randomElement(['boisson', 'biere', 'soda']),
            'unite_mesure' => 'bouteille',
            'bouteilles_par_casier' => 24,
            'quantite_casiers' => fake()->numberBetween(0, 50),
            'quantite_bouteilles' => fake()->numberBetween(0, 23),
            'quantite_verres' => 0,
            'stock_minimum' => 10,
            'prix_casier_fc' => $prixCasierFc,
            'prix_casier_usd' => round($prixCasierFc / 2500, 2), // Taux approximatif
            'prix_bouteille_fc' => $prixBouteilleFc,
            'prix_bouteille_usd' => round($prixBouteilleFc / 2500, 2),
            'prix_verre_fc' => $prixVerreFc,
            'prix_verre_usd' => round($prixVerreFc / 2500, 2),
            'est_actif' => true,
        ];
    }
}
