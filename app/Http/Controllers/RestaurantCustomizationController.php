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
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (!$restaurantId) {
                abort(400, 'Un restaurant_id est requis pour le super-admin.');
            }
        } else {
            $restaurantId = $user->restaurant_id;
            if (!$restaurantId) {
                abort(403, 'Vous devez être associé à un restaurant.');
            }
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

        return Inertia::render('Restaurant/Customization', [
            'customization' => [
                ...$customization->toArray(),
                'logo_url' => $customization->logo ? Storage::disk('public')->url($customization->logo) : null,
            ],
        ]);
    }

    public function update(UpdateRestaurantCustomizationRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin()) {
            $restaurantId = $request->get('restaurant_id');
            if (!$restaurantId) {
                abort(400, 'Un restaurant_id est requis pour le super-admin.');
            }
        } else {
            $restaurantId = $user->restaurant_id;
            if (!$restaurantId) {
                abort(403, 'Vous devez être associé à un restaurant.');
            }
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

        // Ne pas mettre à jour restaurant_id depuis la requête (sécurité)
        unset($data['restaurant_id']);

        // Convertir les chaînes vides en null pour les champs optionnels
        $fieldsToNull = ['adresse', 'ville', 'pays', 'code_postal', 'description', 'site_web', 'couleur_principale'];
        foreach ($fieldsToNull as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $customization->update($data);

        return redirect()->route('restaurant.customization.edit')
            ->with('success', 'Personnalisation mise à jour avec succès.');
    }
}
