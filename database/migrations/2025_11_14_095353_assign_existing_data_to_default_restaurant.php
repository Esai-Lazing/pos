<?php

use App\Models\Restaurant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Trouver ou créer le restaurant par défaut (Pay way)
        $restaurant = Restaurant::firstOrCreate(
            ['email' => 'contact@payway.com'],
            [
                'nom' => 'Pay way',
                'slug' => 'payway',
                'est_actif' => true,
                'date_creation' => now(),
            ]
        );

        // Assigner les produits existants sans restaurant_id au restaurant par défaut
        DB::table('produits')
            ->whereNull('restaurant_id')
            ->update(['restaurant_id' => $restaurant->id]);

        // Assigner les ventes existantes sans restaurant_id au restaurant par défaut
        DB::table('ventes')
            ->whereNull('restaurant_id')
            ->update(['restaurant_id' => $restaurant->id]);

        // Assigner les mouvements de stock existants sans restaurant_id au restaurant par défaut
        DB::table('stock_movements')
            ->whereNull('restaurant_id')
            ->update(['restaurant_id' => $restaurant->id]);

        // Assigner les imprimantes existantes sans restaurant_id au restaurant par défaut
        if (Schema::hasTable('printers')) {
            DB::table('printers')
                ->whereNull('restaurant_id')
                ->update(['restaurant_id' => $restaurant->id]);
        }

        // Assigner les utilisateurs existants sans restaurant_id au restaurant par défaut (sauf super-admin)
        DB::table('users')
            ->whereNull('restaurant_id')
            ->where('role', '!=', 'super-admin')
            ->update(['restaurant_id' => $restaurant->id]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ne rien faire en cas de rollback - on ne peut pas vraiment "désassigner" les données
    }
};
