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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abonnement_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->unique(); // ID unique de la transaction (Stripe, Mobile Money, etc.)
            $table->string('provider'); // stripe, flutterwave, orange_money, mtn_money, espece
            $table->string('payment_method'); // carte_bancaire, mobile_money, espece
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('status'); // pending, processing, completed, failed, refunded
            $table->json('metadata')->nullable(); // Données supplémentaires du provider
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['abonnement_id', 'status']);
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
