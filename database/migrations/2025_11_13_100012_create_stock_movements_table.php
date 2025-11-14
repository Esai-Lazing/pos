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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type')->default('entree'); // entree, sortie, ajustement
            $table->string('unite')->default('bouteille'); // casier, bouteille, verre
            $table->integer('quantite_casiers')->default(0);
            $table->integer('quantite_bouteilles')->default(0);
            $table->integer('quantite_verres')->default(0);
            $table->integer('quantite_totale_bouteilles')->default(0); // Calculé automatiquement
            $table->decimal('prix_achat_fc', 15, 2)->nullable();
            $table->decimal('prix_achat_usd', 15, 2)->nullable();
            $table->text('raison')->nullable();
            $table->string('reference_fournisseur')->nullable();
            $table->timestamp('date_mouvement');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
