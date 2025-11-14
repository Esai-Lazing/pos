<?php

namespace Database\Seeders;

use App\Models\Abonnement;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer un super-admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@juvisy.com'],
            [
                'name' => 'Super Administrateur',
                'password' => Hash::make('password'),
                'role' => 'super-admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Créer un restaurant par défaut (JUVISY)
        $restaurant = Restaurant::firstOrCreate(
            ['email' => 'contact@juvisy.com'],
            [
                'nom' => 'JUVISY',
                'slug' => 'juvisy',
                'telephone' => null,
                'est_actif' => true,
                'date_creation' => now(),
            ]
        );

        // Créer un abonnement pour le restaurant
        Abonnement::firstOrCreate(
            ['restaurant_id' => $restaurant->id, 'est_actif' => true],
            [
                'plan' => 'premium',
                'montant_mensuel' => 99.99,
                'date_debut' => now(),
                'date_fin' => null,
                'statut' => 'actif',
            ]
        );

        // Créer un utilisateur admin pour le restaurant
        $admin = User::firstOrCreate(
            ['email' => 'admin@juvisy.com'],
            [
                'name' => 'Administrateur JUVISY',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'restaurant_id' => $restaurant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Créer un utilisateur caisse pour le restaurant
        User::firstOrCreate(
            ['email' => 'caisse@juvisy.com'],
            [
                'name' => 'Caissier JUVISY',
                'password' => Hash::make('password'),
                'role' => 'caisse',
                'restaurant_id' => $restaurant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Créer un utilisateur stock pour le restaurant
        User::firstOrCreate(
            ['email' => 'stock@juvisy.com'],
            [
                'name' => 'Gestionnaire Stock JUVISY',
                'password' => Hash::make('password'),
                'role' => 'stock',
                'restaurant_id' => $restaurant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Seeders
        $this->call([
            ProduitSeeder::class,
            PrinterSeeder::class,
        ]);
    }
}
