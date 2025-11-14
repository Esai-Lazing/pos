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
        Schema::create('vente_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained()->onDelete('cascade');
            $table->foreignId('produit_id')->constrained()->onDelete('restrict');
            $table->string('unite')->default('bouteille'); // casier, bouteille, verre
            $table->integer('quantite');
            $table->decimal('prix_unitaire_fc', 15, 2);
            $table->decimal('prix_unitaire_usd', 15, 2)->default(0);
            $table->decimal('sous_total_fc', 15, 2);
            $table->decimal('sous_total_usd', 15, 2)->default(0);
            $table->decimal('benefice_fc', 15, 2)->default(0);
            $table->decimal('benefice_usd', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vente_items');
    }
};
