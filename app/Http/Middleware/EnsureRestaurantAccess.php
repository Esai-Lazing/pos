<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRestaurantAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Si pas d'utilisateur authentifié, laisser passer (géré par auth middleware)
        if (!$user) {
            return $next($request);
        }

        // Les super-admin ont accès à tout
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Vérifier que les utilisateurs non super-admin ont un restaurant_id
        if (!$user->restaurant_id) {
            abort(403, 'Vous devez être associé à un restaurant pour accéder à cette ressource.');
        }

        // Charger le restaurant avec la relation (si pas déjà chargé)
        if (!$user->relationLoaded('restaurant')) {
            $user->load('restaurant');
        }

        // Vérifier que le restaurant de l'utilisateur est actif
        $restaurant = $user->restaurant;
        if ($restaurant && !$restaurant->est_actif) {
            abort(403, 'Votre restaurant a été suspendu. Veuillez contacter le support.');
        }

        return $next($request);
    }
}
