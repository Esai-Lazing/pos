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
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('type_etablissement')->nullable()->after('telephone'); // restaurant, bar, cafe, hotel, etc.
            $table->string('categorie')->nullable()->after('type_etablissement'); // fast-food, gastronomique, traditionnel, etc.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['type_etablissement', 'categorie']);
        });
    }
};
