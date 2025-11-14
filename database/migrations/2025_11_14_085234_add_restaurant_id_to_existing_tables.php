<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ajouter restaurant_id aux produits
        Schema::table('produits', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Ajouter restaurant_id aux ventes
        Schema::table('ventes', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Ajouter restaurant_id aux stock_movements
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Ajouter restaurant_id aux printers
        if (Schema::hasTable('printers')) {
            Schema::table('printers', function (Blueprint $table) {
                $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });

        Schema::table('ventes', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });

        if (Schema::hasTable('printers')) {
            Schema::table('printers', function (Blueprint $table) {
                $table->dropForeign(['restaurant_id']);
                $table->dropColumn('restaurant_id');
            });
        }
    }
};
