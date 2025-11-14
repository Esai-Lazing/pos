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
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('type')->default('bluetooth'); // bluetooth, usb, wifi
            $table->string('adresse')->nullable(); // MAC address, IP, ou nom USB
            $table->string('modele')->nullable();
            $table->integer('largeur_papier')->default(80); // mm
            $table->json('parametres')->nullable(); // Paramètres spécifiques
            $table->boolean('est_actif')->default(true);
            $table->boolean('est_par_defaut')->default(false);
            $table->text('message_facture')->nullable();
            $table->string('nom_restaurant')->nullable();
            $table->string('adresse_restaurant')->nullable();
            $table->string('telephone_restaurant')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printers');
    }
};
