<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAbonnementRequest;
use App\Models\Abonnement;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AbonnementController extends Controller
{
    public function edit(Restaurant $restaurant): Response
    {
        $abonnement = $restaurant->abonnement ?? $restaurant->abonnements()->latest()->first();

        return Inertia::render('Restaurant/AbonnementEdit', [
            'restaurant' => $restaurant,
            'abonnement' => $abonnement,
        ]);
    }

    public function update(UpdateAbonnementRequest $request, Restaurant $restaurant): RedirectResponse
    {
        $abonnement = $restaurant->abonnement ?? $restaurant->abonnements()->latest()->first();

        if ($abonnement) {
            $abonnement->update($request->validated());
        } else {
            // Créer un nouvel abonnement si aucun n'existe
            Abonnement::create([
                'restaurant_id' => $restaurant->id,
                ...$request->validated(),
            ]);
        }

        return redirect()->route('restaurant.show', $restaurant)
            ->with('success', 'Abonnement mis à jour avec succès.');
    }

    public function suspend(Restaurant $restaurant): RedirectResponse
    {
        $abonnement = $restaurant->abonnement;
        
        if ($abonnement) {
            $abonnement->update([
                'statut' => 'suspendu',
                'est_actif' => false,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Abonnement suspendu avec succès.');
    }

    public function activate(Restaurant $restaurant): RedirectResponse
    {
        $abonnement = $restaurant->abonnement;
        
        if ($abonnement) {
            $abonnement->update([
                'statut' => 'actif',
                'est_actif' => true,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Abonnement activé avec succès.');
    }
}
