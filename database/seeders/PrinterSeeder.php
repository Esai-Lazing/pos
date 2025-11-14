<?php

namespace Database\Seeders;

use App\Models\Printer;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class PrinterSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer le restaurant par défaut (JUVISY)
        $restaurant = Restaurant::where('slug', 'juvisy')->first();
        
        if (!$restaurant) {
            // Si le restaurant n'existe pas, créer un restaurant par défaut
            $restaurant = Restaurant::create([
                'nom' => 'JUVISY',
                'slug' => 'juvisy',
                'email' => 'contact@juvisy.com',
                'est_actif' => true,
                'date_creation' => now(),
            ]);
        }

        Printer::updateOrCreate(
            ['nom' => 'Imprimante POS JUVISY'],
            [
                'restaurant_id' => $restaurant->id,
                'type' => 'wifi',
                'adresse' => null,
                'modele' => 'POS-80',
                'largeur_papier' => 80,
                'est_actif' => true,
                'est_par_defaut' => true,
                'message_facture' => 'Merci de votre visite chez Juvisy !',
                'nom_restaurant' => 'JUVISY',
                'adresse_restaurant' => '217 Avenue Congo Motors, Quartier Gambella I, Commune Lubumbashi',
                'telephone_restaurant' => null,
            ]
        );
    }
}
