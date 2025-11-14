<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Printer extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'nom',
        'type',
        'adresse',
        'modele',
        'largeur_papier',
        'parametres',
        'est_actif',
        'est_par_defaut',
        'message_facture',
        'nom_restaurant',
        'adresse_restaurant',
        'telephone_restaurant',
    ];

    protected function casts(): array
    {
        return [
            'largeur_papier' => 'integer',
            'parametres' => 'array',
            'est_actif' => 'boolean',
            'est_par_defaut' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($printer) {
            if ($printer->est_par_defaut) {
                $query = static::where('est_par_defaut', true);
                if ($printer->restaurant_id) {
                    $query->where('restaurant_id', $printer->restaurant_id);
                }
                $query->update(['est_par_defaut' => false]);
            }
        });

        static::updating(function ($printer) {
            if ($printer->est_par_defaut && $printer->isDirty('est_par_defaut')) {
                $query = static::where('id', '!=', $printer->id)
                    ->where('est_par_defaut', true);
                if ($printer->restaurant_id) {
                    $query->where('restaurant_id', $printer->restaurant_id);
                }
                $query->update(['est_par_defaut' => false]);
            }
        });
    }

    public static function getParDefaut(?int $restaurantId = null): ?self
    {
        $query = static::where('est_actif', true)
            ->where('est_par_defaut', true);
        
        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }
        
        return $query->first();
    }
}
