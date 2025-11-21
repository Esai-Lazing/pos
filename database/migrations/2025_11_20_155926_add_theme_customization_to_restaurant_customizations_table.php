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
        Schema::table('restaurant_customizations', function (Blueprint $table) {
            $table->string('primary_color')->default('#000000')->after('couleur_principale');
            $table->string('secondary_color')->default('#ffffff')->after('primary_color');
            $table->string('font_family')->default('Inter')->after('secondary_color');
            $table->string('font_size')->default('normal')->after('font_family'); // small, normal, large
            $table->string('layout_type')->default('classic')->after('font_size'); // classic, modern, grid
            $table->string('nav_style')->default('top')->after('layout_type'); // top, side
            $table->boolean('show_banner')->default(true)->after('nav_style');
            $table->string('banner_image')->nullable()->after('show_banner');
            $table->json('custom_css')->nullable()->after('banner_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurant_customizations', function (Blueprint $table) {
            $table->dropColumn([
                'primary_color',
                'secondary_color',
                'font_family',
                'font_size',
                'layout_type',
                'nav_style',
                'show_banner',
                'banner_image',
                'custom_css',
            ]);
        });
    }
};
