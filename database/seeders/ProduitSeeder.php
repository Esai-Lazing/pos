<?php

namespace Database\Seeders;

use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class ProduitSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer le restaurant par défaut (Pay way)
        $restaurant = Restaurant::where('slug', 'payway')->first();

        if (! $restaurant) {
            // Si le restaurant n'existe pas, créer un restaurant par défaut
            $restaurant = Restaurant::create([
                'nom' => 'Pay way',
                'slug' => 'payway',
                'email' => 'contact@payway.com',
                'est_actif' => true,
                'date_creation' => now(),
            ]);
        }

        $produits = [
            [
                'nom' => 'Primus',
                'code' => 'PRI001',
                'categorie' => 'biere',
                'bouteilles_par_casier' => 24,
                'quantite_casiers' => 20,
                'quantite_bouteilles' => 12,
                'stock_minimum' => 1,
                'prix_casier_fc' => 48000,
                'prix_casier_usd' => 19.20,
                'prix_bouteille_fc' => 2200,
                'prix_bouteille_usd' => 0.88,
                'prix_verre_fc' => 700,
                'prix_verre_usd' => 0.28,
            ],
            [
                'nom' => 'Heineken',
                'code' => 'HEI001',
                'categorie' => 'biere',
                'bouteilles_par_casier' => 24,
                'quantite_casiers' => 15,
                'quantite_bouteilles' => 8,
                'stock_minimum' => 1,
                'prix_casier_fc' => 60000,
                'prix_casier_usd' => 24.00,
                'prix_bouteille_fc' => 2800,
                'prix_bouteille_usd' => 1.12,
                'prix_verre_fc' => 900,
                'prix_verre_usd' => 0.36,
            ],
            [
                'nom' => 'Coca-Cola',
                'code' => 'COC001',
                'categorie' => 'soda',
                'bouteilles_par_casier' => 24,
                'quantite_casiers' => 30,
                'quantite_bouteilles' => 15,
                'stock_minimum' => 2,
                'prix_casier_fc' => 36000,
                'prix_casier_usd' => 14.40,
                'prix_bouteille_fc' => 1800,
                'prix_bouteille_usd' => 0.72,
                'prix_verre_fc' => 600,
                'prix_verre_usd' => 0.24,
            ],
            [
                'nom' => 'Fanta',
                'code' => 'FAN001',
                'categorie' => 'soda',
                'bouteilles_par_casier' => 24,
                'quantite_casiers' => 25,
                'quantite_bouteilles' => 10,
                'stock_minimum' => 2,
                'prix_casier_fc' => 36000,
                'prix_casier_usd' => 14.40,
                'prix_bouteille_fc' => 1800,
                'prix_bouteille_usd' => 0.72,
                'prix_verre_fc' => 600,
                'prix_verre_usd' => 0.24,
            ],
            [
                'nom' => 'Mutzig',
                'code' => 'MUT001',
                'categorie' => 'biere',
                'bouteilles_par_casier' => 24,
                'quantite_casiers' => 18,
                'quantite_bouteilles' => 5,
                'stock_minimum' => 1,
                'prix_casier_fc' => 54000,
                'prix_casier_usd' => 21.60,
                'prix_bouteille_fc' => 2500,
                'prix_bouteille_usd' => 1.00,
                'prix_verre_fc' => 800,
                'prix_verre_usd' => 0.32,
            ],
            [
                'nom' => 'Turbo King',
                'code' => 'TUR001',
                'categorie' => 'biere',
                'bouteilles_par_casier' => 12,
                'quantite_casiers' => 25,
                'quantite_bouteilles' => 6,
                'stock_minimum' => 2,
                'prix_casier_fc' => 30000,
                'prix_casier_usd' => 12.00,
                'prix_bouteille_fc' => 2800,
                'prix_bouteille_usd' => 1.12,
                'prix_verre_fc' => 900,
                'prix_verre_usd' => 0.36,
            ],
        ];

        foreach ($produits as $produitData) {
            Produit::updateOrCreate(
                ['code' => $produitData['code']],
                array_merge($produitData, ['restaurant_id' => $restaurant->id])
            );
        }
    }
}
