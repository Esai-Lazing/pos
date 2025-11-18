<?php

namespace App\Services;

use App\Models\Restaurant;

class RestaurantService
{
    /**
     * Obtenir les fonctionnalités disponibles selon le type et la catégorie
     */
    public static function getAvailableFeatures(Restaurant $restaurant): array
    {
        $type = $restaurant->type_etablissement;
        $categorie = $restaurant->categorie;

        $features = [
            'ventes' => true,
            'stock' => true,
            'impression' => true,
        ];

        // Adapter selon le type d'établissement
        switch ($type) {
            case 'restaurant':
            case 'fast-food':
                $features['gestion_tables'] = true;
                $features['commandes'] = true;
                $features['menu_digital'] = true;
                break;

            case 'bar':
            case 'cafe':
                $features['gestion_bar'] = true;
                $features['happy_hour'] = true;
                $features['cocktails'] = true;
                break;

            case 'hotel':
                $features['gestion_chambres'] = true;
                $features['room_service'] = true;
                $features['mini_bar'] = true;
                break;

            default:
                break;
        }

        // Adapter selon la catégorie
        switch ($categorie) {
            case 'gastronomique':
                $features['reservations'] = true;
                $features['menu_degustation'] = true;
                break;

            case 'fast-food':
                $features['drive_thru'] = true;
                $features['livraison'] = true;
                break;

            case 'pizzeria':
                $features['personnalisation_pizza'] = true;
                $features['livraison'] = true;
                break;

            default:
                break;
        }

        return $features;
    }

    /**
     * Vérifier si une fonctionnalité est disponible pour le restaurant
     */
    public static function canUseFeature(Restaurant $restaurant, string $feature): bool
    {
        // Vérifier d'abord les limitations d'abonnement
        if (! $restaurant->hasActiveSubscription()) {
            return false;
        }

        $limitations = $restaurant->getLimitations();

        // Vérifier les limitations spécifiques
        switch ($feature) {
            case 'rapports':
                return $limitations['rapports'] ?? false;

            case 'personnalisation':
                return $limitations['personnalisation'] ?? false;

            case 'impression':
                return $limitations['impression'] ?? true;

            default:
                break;
        }

        // Vérifier les fonctionnalités disponibles selon le type/catégorie
        $availableFeatures = self::getAvailableFeatures($restaurant);

        return $availableFeatures[$feature] ?? false;
    }

    /**
     * Obtenir les catégories de produits suggérées selon le type d'établissement
     */
    public static function getSuggestedProductCategories(Restaurant $restaurant): array
    {
        $type = $restaurant->type_etablissement;
        $categorie = $restaurant->categorie;

        $categories = [];

        switch ($type) {
            case 'restaurant':
            case 'fast-food':
                $categories = ['Entrées', 'Plats', 'Desserts', 'Boissons'];
                break;

            case 'bar':
            case 'cafe':
                $categories = ['Cocktails', 'Bières', 'Vins', 'Softs', 'Snacks'];
                break;

            case 'hotel':
                $categories = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Room Service', 'Mini-bar'];
                break;

            default:
                $categories = ['Produits'];
                break;
        }

        // Adapter selon la catégorie
        if ($categorie === 'pizzeria') {
            $categories = ['Pizzas', 'Pâtes', 'Salades', 'Desserts', 'Boissons'];
        } elseif ($categorie === 'gastronomique') {
            $categories = ['Entrées', 'Plats principaux', 'Desserts', 'Vins', 'Digestifs'];
        }

        return $categories;
    }
}
