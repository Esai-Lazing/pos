<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionLimits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $limit  Type de limite à vérifier (users, products, sales)
     */
    public function handle(Request $request, Closure $next, string $limit): Response
    {
        $user = $request->user();
        $restaurant = $user?->restaurant;

        if (! $restaurant) {
            abort(403, 'Aucun restaurant associé à votre compte.');
        }

        // Vérifier si le restaurant a un abonnement actif
        if (! $restaurant->hasActiveSubscription()) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'Votre abonnement a expiré. Veuillez renouveler votre abonnement.');
        }

        // Vérifier les limites spécifiques
        switch ($limit) {
            case 'users':
                if ($restaurant->hasReachedUserLimit()) {
                    return redirect()
                        ->back()
                        ->with('error', 'Vous avez atteint la limite d\'utilisateurs pour votre plan d\'abonnement.');
                }
                break;

            case 'products':
                if ($restaurant->hasReachedProductLimit()) {
                    return redirect()
                        ->back()
                        ->with('error', 'Vous avez atteint la limite de produits pour votre plan d\'abonnement.');
                }
                break;

            case 'sales':
                if ($restaurant->hasReachedMonthlySalesLimit()) {
                    return redirect()
                        ->back()
                        ->with('error', 'Vous avez atteint la limite de ventes mensuelles pour votre plan d\'abonnement.');
                }
                break;
        }

        return $next($request);
    }
}
