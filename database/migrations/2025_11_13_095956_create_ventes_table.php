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
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('montant_total_fc', 15, 2)->default(0);
            $table->decimal('montant_total_usd', 15, 2)->default(0);
            $table->decimal('montant_paye_fc', 15, 2)->default(0);
            $table->decimal('montant_paye_usd', 15, 2)->default(0);
            $table->decimal('rendu_fc', 15, 2)->default(0);
            $table->decimal('rendu_usd', 15, 2)->default(0);
            $table->string('mode_paiement')->default('mixte'); // fc, usd, mixte
            $table->decimal('taux_change', 10, 4)->nullable();
            $table->boolean('est_imprime')->default(false);
            $table->timestamp('imprime_at')->nullable();
            $table->boolean('est_synchronise')->default(true);
            $table->json('donnees_offline')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventes');
    }
};
