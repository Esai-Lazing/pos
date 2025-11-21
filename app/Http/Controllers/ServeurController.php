<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServeurRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ServeurController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $restaurant = $user->restaurant;
        
        $serveurs = User::where('role', 'serveur')
            ->where('restaurant_id', $user->restaurant_id)
            ->latest()
            ->paginate(20);

        // Calculer les statistiques de serveurs
        $serveurStats = [
            'total_serveurs' => 0,
            'max_serveurs' => null,
        ];

        if ($restaurant) {
            $limitations = $restaurant->getLimitations();
            $serveurStats['max_serveurs'] = $limitations['max_serveurs'] ?? null;
            $serveurStats['total_serveurs'] = $restaurant->users()
                ->where('role', 'serveur')
                ->count();
        }

        return Inertia::render('Serveur/Index', [
            'serveurs' => $serveurs,
            'serveurStats' => $serveurStats,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Serveur/Create');
    }

    public function store(StoreServeurRequest $request): RedirectResponse
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        // Vérifier la limite de serveurs
        if ($restaurant && $restaurant->hasReachedServerLimit()) {
            $limitations = $restaurant->getLimitations();
            $maxServeurs = $limitations['max_serveurs'] ?? null;
            $currentServeurs = $restaurant->users()->where('role', 'serveur')->count();

            return redirect()->back()
                ->withInput()
                ->withErrors([
                    'limit_reached' => true,
                    'limit_message' => $maxServeurs === null
                        ? 'Impossible de créer plus de serveurs.'
                        : "Vous avez atteint la limite de serveurs de votre plan ({$currentServeurs}/{$maxServeurs}). Veuillez upgrader votre abonnement pour ajouter plus de serveurs.",
                ])
                ->with('limit_reached', true)
                ->with('limit_message', $maxServeurs === null
                    ? 'Impossible de créer plus de serveurs.'
                    : "Vous avez atteint la limite de serveurs de votre plan ({$currentServeurs}/{$maxServeurs}). Veuillez upgrader votre abonnement pour ajouter plus de serveurs.")
                ->with('current_plan', $restaurant->abonnement?->plan ?? 'N/A')
                ->with('current_serveurs', $currentServeurs)
                ->with('max_serveurs', $maxServeurs);
        }

        // Générer l'email avec le nom du restaurant
        $restaurantDomain = 'restaurant.local';
        if ($restaurant && $restaurant->nom) {
            // Convertir le nom du restaurant en format de domaine (minuscules, remplacer les espaces par des tirets, supprimer les caractères spéciaux)
            $restaurantDomain = strtolower($restaurant->nom);
            $restaurantDomain = preg_replace('/[^a-z0-9-]/', '', str_replace(' ', '-', $restaurantDomain));
            $restaurantDomain = $restaurantDomain ?: 'restaurant';
            $restaurantDomain .= '.com';
        }

        User::create([
            'name' => $request->name,
            'email' => 'serveur-'.uniqid().'@'.$restaurantDomain,
            'password' => Hash::make($request->pin_code), // Utiliser le PIN comme mot de passe
            'role' => 'serveur',
            'restaurant_id' => $user->restaurant_id,
            'pin_code' => $request->pin_code,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('serveur.index')
            ->with('success', 'Serveur créé avec succès.');
    }

    public function destroy(User $serveur): RedirectResponse
    {
        if ($serveur->role !== 'serveur') {
            abort(403, 'Cet utilisateur n\'est pas un serveur.');
        }

        $serveur->delete();

        return redirect()->route('serveur.index')
            ->with('success', 'Serveur supprimé avec succès.');
    }
}
