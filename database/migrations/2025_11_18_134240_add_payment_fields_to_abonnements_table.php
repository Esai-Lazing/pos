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
        Schema::table('abonnements', function (Blueprint $table) {
            $table->string('mode_paiement')->nullable()->after('montant_mensuel'); // mobile_money, carte_bancaire, espece, autre
            $table->string('numero_transaction')->nullable()->after('mode_paiement');
            $table->timestamp('date_paiement')->nullable()->after('numero_transaction');
            $table->json('limitations')->nullable()->after('notes'); // Stocker les limitations du plan
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropColumn(['mode_paiement', 'numero_transaction', 'date_paiement', 'limitations']);
        });
    }
};
