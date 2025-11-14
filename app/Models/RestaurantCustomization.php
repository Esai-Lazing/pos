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
        'couleur_principale',
        'horaires',
    ];

    protected function casts(): array
    {
        return [
            'reseaux_sociaux' => 'array',
            'horaires' => 'array',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
