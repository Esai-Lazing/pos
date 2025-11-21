<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
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
                ->with('error', 'Votre abonnement a expiré. Veuillez renouveler votre abonnement.')
                ->with('subscription_expired', true);
        }

        // Vérifier les limites spécifiques
        switch ($limit) {
            case 'users':
                if ($restaurant->hasReachedUserLimit()) {
                    $abonnement = $restaurant->abonnements()->latest()->first();
                    $limitations = $abonnement ? $abonnement->getLimitations() : [];
                    $maxUsers = $limitations['max_users'] ?? null;
                    $currentUsers = $restaurant->users()->count();
                    $currentPlan = $abonnement ? $abonnement->plan : 'simple';

                    // Si c'est une requête POST vers user.store, retourner avec Inertia
                    if ($request->routeIs('user.store') && $request->isMethod('post')) {
                        return Inertia::render('User/Create', [
                            'limit_reached' => true,
                            'limit_message' => "Vous avez atteint la limite d'utilisateurs de votre plan actuel ({$currentUsers}/{$maxUsers}). Veuillez upgrader votre abonnement pour créer plus d'utilisateurs.",
                            'current_plan' => $currentPlan,
                            'current_users' => $currentUsers,
                            'max_users' => $maxUsers,
                            // Préserver les données du formulaire
                            'old' => $request->all(),
                        ])->toResponse($request);
                    }

                    // Sinon, rediriger avec un message d'erreur générique
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
