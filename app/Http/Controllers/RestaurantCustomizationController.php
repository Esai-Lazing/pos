<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRestaurantCustomizationRequest;
use App\Models\RestaurantCustomization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantCustomizationController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (! $restaurantId) {
                abort(400, 'Un restaurant_id est requis pour le super-admin.');
            }
            $restaurant = \App\Models\Restaurant::find($restaurantId);
        } else {
            $restaurantId = $user->restaurant_id;
            if (! $restaurantId) {
                abort(403, 'Vous devez être associé à un restaurant.');
            }
            $restaurant = $user->restaurant;
        }

        // Vérifier l'accès à la personnalisation selon l'abonnement
        if ($restaurant && ! $restaurant->canAccessFeature('personnalisation')) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'La personnalisation n\'est pas disponible avec votre plan d\'abonnement actuel. Veuillez upgrader votre abonnement pour accéder à cette fonctionnalité.');
        }

        $customization = RestaurantCustomization::firstOrCreate(
            ['restaurant_id' => $restaurantId],
            [
                'adresse' => null,
                'ville' => null,
                'pays' => null,
                'code_postal' => null,
                'description' => null,
                'site_web' => null,
                'couleur_principale' => null,
                'reseaux_sociaux' => [],
                'horaires' => [],
                // Default values for new fields
                'primary_color' => '#000000',
                'secondary_color' => '#ffffff',
                'font_family' => 'Instrument Sans',
                'font_size' => 'normal',
                'layout_type' => 'classic',
                'nav_style' => 'top',
                'show_banner' => true,
            ]
        );

        return Inertia::render('Restaurant/Customization', [
            'customization' => [
                ...$customization->toArray(),
                'logo_url' => $customization->logo ? Storage::disk('public')->url($customization->logo) : null,
                'banner_url' => $customization->banner_image ? Storage::disk('public')->url($customization->banner_image) : null,
            ],
        ]);
    }

    public function update(UpdateRestaurantCustomizationRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (! $restaurantId) {
                abort(400, 'Un restaurant_id est requis pour le super-admin.');
            }
            $restaurant = \App\Models\Restaurant::find($restaurantId);
        } else {
            $restaurantId = $user->restaurant_id;
            if (! $restaurantId) {
                abort(403, 'Vous devez être associé à un restaurant.');
            }
            $restaurant = $user->restaurant;
        }

        // Vérifier l'accès à la personnalisation selon l'abonnement
        if ($restaurant && ! $restaurant->canAccessFeature('personnalisation')) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'La personnalisation n\'est pas disponible avec votre plan d\'abonnement actuel. Veuillez upgrader votre abonnement pour accéder à cette fonctionnalité.');
        }

        $customization = RestaurantCustomization::firstOrCreate(
            ['restaurant_id' => $restaurantId],
            [
                'adresse' => null,
                'ville' => null,
                'pays' => null,
                'code_postal' => null,
                'description' => null,
                'site_web' => null,
                'couleur_principale' => null,
                'reseaux_sociaux' => [],
                'horaires' => [],
            ]
        );

        $data = $request->validated();

        // Gérer l'upload du logo
        if ($request->hasFile('logo')) {
            // Supprimer l'ancien logo s'il existe
            if ($customization->logo) {
                Storage::disk('public')->delete($customization->logo);
            }

            $logoPath = $request->file('logo')->store('logos', 'public');
            $data['logo'] = $logoPath;
        } else {
            // Ne pas écraser le logo existant si aucun nouveau logo n'est fourni
            unset($data['logo']);
        }

        // Gérer l'upload de la bannière
        if ($request->hasFile('banner_image')) {
            // Supprimer l'ancienne bannière si elle existe
            if ($customization->banner_image) {
                Storage::disk('public')->delete($customization->banner_image);
            }

            $bannerPath = $request->file('banner_image')->store('banners', 'public');
            $data['banner_image'] = $bannerPath;
        } else {
            // Ne pas écraser la bannière existante si aucune nouvelle bannière n'est fournie
            unset($data['banner_image']);
        }

        // Ne pas mettre à jour restaurant_id depuis la requête (sécurité)
        unset($data['restaurant_id']);

        // Convertir les chaînes vides en null pour les champs optionnels
        $fieldsToNull = ['adresse', 'ville', 'pays', 'code_postal', 'description', 'site_web', 'couleur_principale'];
        foreach ($fieldsToNull as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        // Assurer la synchronisation pour la rétrocompatibilité
        if (isset($data['primary_color'])) {
            $data['couleur_principale'] = $data['primary_color'];
        } elseif (isset($data['couleur_principale'])) {
            $data['primary_color'] = $data['couleur_principale'];
        }

        // S'assurer que tous les champs de personnalisation sont bien présents
        // Si un champ n'est pas dans la requête, utiliser la valeur existante ou la valeur par défaut
        $defaults = [
            'primary_color' => $customization->primary_color ?? '#000000',
            'secondary_color' => $customization->secondary_color ?? '#ffffff',
            'font_family' => 'Instrument Sans', // Toujours utiliser la police par défaut
            'font_size' => $customization->font_size ?? 'normal',
            'layout_type' => $customization->layout_type ?? 'classic',
            'nav_style' => $customization->nav_style ?? 'top',
            'show_banner' => $customization->show_banner ?? true,
        ];

        foreach ($defaults as $key => $defaultValue) {
            if (! isset($data[$key])) {
                $data[$key] = $defaultValue;
            }
        }

        // Gérer le booléen show_banner correctement
        if (isset($data['show_banner'])) {
            $data['show_banner'] = filter_var($data['show_banner'], FILTER_VALIDATE_BOOLEAN);
        }

        // Filtrer uniquement les champs qui existent dans le modèle
        $fillable = $customization->getFillable();
        $data = array_intersect_key($data, array_flip($fillable));

        // Log pour déboguer (à retirer en production)
        \Log::info('Updating customization', [
            'restaurant_id' => $restaurantId,
            'data' => $data,
        ]);

        $customization->update($data);

        // Rafraîchir le modèle pour s'assurer que les données sont à jour
        $customization->refresh();

        return redirect()->route('restaurant.customization.edit')
            ->with('success', 'Personnalisation mise à jour avec succès.');
    }

    /**
     * Mettre à jour rapidement la typographie depuis le header
     */
    public function updateTypography(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (! $restaurantId) {
                return response()->json(['error' => 'Un restaurant_id est requis pour le super-admin.'], 400);
            }
        } else {
            $restaurantId = $user->restaurant_id;
            if (! $restaurantId) {
                return response()->json(['error' => 'Vous devez être associé à un restaurant.'], 403);
            }
        }

        $request->validate([
            'font_family' => ['nullable', 'string', 'max:50'],
            'font_size' => ['nullable', 'string', 'in:small,normal,large'],
        ]);

        $customization = RestaurantCustomization::firstOrCreate(
            ['restaurant_id' => $restaurantId],
            []
        );

        $customization->update([
            'font_family' => $request->font_family ?? $customization->font_family,
            'font_size' => $request->font_size ?? $customization->font_size,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Typographie mise à jour avec succès.',
        ]);
    }

    /**
     * Mettre à jour le thème du restaurant
     */
    public function updateTheme(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est admin du restaurant
        if (!$user->isAdmin() && !$user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Seuls les administrateurs peuvent modifier le thème.');
        }

        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (!$restaurantId) {
                return redirect()->back()->with('error', 'Un restaurant_id est requis pour le super-admin.');
            }
            $restaurant = \App\Models\Restaurant::find($restaurantId);
        } else {
            $restaurantId = $user->restaurant_id;
            if (!$restaurantId) {
                return redirect()->back()->with('error', 'Vous devez être associé à un restaurant.');
            }
            $restaurant = $user->restaurant;
        }

        // Vérifier l'accès à la personnalisation selon l'abonnement
        if ($restaurant && !$restaurant->canAccessFeature('personnalisation')) {
            return redirect()->back()->with('error', 'La personnalisation n\'est pas disponible avec votre plan d\'abonnement actuel. Veuillez upgrader votre abonnement pour accéder à cette fonctionnalité.');
        }

        $request->validate([
            'theme' => ['required', 'string', 'in:default,blue,green,red,orange,yellow,violet,restaurant'],
        ]);

        $customization = RestaurantCustomization::firstOrCreate(
            ['restaurant_id' => $restaurantId],
            []
        );

        $customization->update([
            'theme' => $request->theme,
        ]);

        return redirect()->back()->with('success', 'Thème mis à jour avec succès.');
    }
}
