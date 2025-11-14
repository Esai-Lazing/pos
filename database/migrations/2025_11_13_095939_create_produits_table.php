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
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->string('categorie')->default('boisson');
            $table->string('unite_mesure')->default('bouteille'); // casier, bouteille, verre
            $table->integer('bouteilles_par_casier')->default(24);
            $table->integer('quantite_casiers')->default(0);
            $table->integer('quantite_bouteilles')->default(0);
            $table->integer('quantite_verres')->default(0);
            $table->integer('stock_minimum')->default(10);
            $table->decimal('prix_casier_fc', 15, 2)->nullable()->default(0);
            $table->decimal('prix_casier_usd', 15, 2)->nullable()->default(0);
            $table->decimal('prix_bouteille_fc', 15, 2)->nullable()->default(0);
            $table->decimal('prix_bouteille_usd', 15, 2)->nullable()->default(0);
            $table->decimal('prix_verre_fc', 15, 2)->nullable()->default(0);
            $table->decimal('prix_verre_usd', 15, 2)->nullable()->default(0);
            $table->boolean('est_actif')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
