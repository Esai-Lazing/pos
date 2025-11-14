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
        Schema::create('restaurant_customizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('logo')->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->nullable();
            $table->string('code_postal')->nullable();
            $table->text('description')->nullable();
            $table->string('site_web')->nullable();
            $table->json('reseaux_sociaux')->nullable(); // Facebook, Instagram, etc.
            $table->string('couleur_principale')->nullable(); // Pour le thème
            $table->json('horaires')->nullable(); // Horaires d'ouverture
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_customizations');
    }
};
