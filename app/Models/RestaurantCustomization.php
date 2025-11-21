<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantCustomization extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'logo',
        'adresse',
        'ville',
        'pays',
        'code_postal',
        'description',
        'site_web',
        'reseaux_sociaux',
        'couleur_principale', // Keeping for backward compatibility
        'primary_color',
        'secondary_color',
        'font_family',
        'font_size',
        'layout_type',
        'nav_style',
        'show_banner',
        'banner_image',
        'custom_css',
        'horaires',
        'theme',
    ];

    protected function casts(): array
    {
        return [
            'reseaux_sociaux' => 'array',
            'horaires' => 'array',
            'show_banner' => 'boolean',
            'custom_css' => 'array',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
