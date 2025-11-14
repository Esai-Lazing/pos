<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vente>
 */
class VenteFactory extends Factory
{
    protected $model = Vente::class;

    public function definition(): array
    {
        $montantTotalFc = fake()->numberBetween(5000, 100000);
        $montantPayeFc = $montantTotalFc + fake()->numberBetween(0, 5000);

        return [
            'user_id' => User::factory(),
            'montant_total_fc' => $montantTotalFc,
            'montant_total_usd' => round($montantTotalFc / 2500, 2),
            'montant_paye_fc' => $montantPayeFc,
            'montant_paye_usd' => round($montantPayeFc / 2500, 2),
            'rendu_fc' => $montantPayeFc - $montantTotalFc,
            'rendu_usd' => round(($montantPayeFc - $montantTotalFc) / 2500, 2),
            'mode_paiement' => fake()->randomElement(['fc', 'usd', 'mixte']),
            'taux_change' => 2500,
            'est_imprime' => fake()->boolean(70),
            'est_synchronise' => true,
        ];
    }
}
