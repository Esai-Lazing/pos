<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPaymentStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Le super admin n'a pas besoin de valider un paiement
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user->restaurant) {
            return redirect()->route('login');
        }

        $abonnement = $user->restaurant->abonnements()->latest()->first();

        // Si pas d'abonnement ou paiement non validé, rediriger vers la page de paiement
        if (! $abonnement || ! $abonnement->isPaymentValidated()) {
            // Ne pas rediriger si on est déjà sur la page de paiement
            if (! $request->routeIs('payment.*')) {
                return redirect()->route('payment.show');
            }
        }

        return $next($request);
    }
}
