<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            abort(401);
        }

        $user = $request->user();

        if (! $user->is_active) {
            abort(403, 'Votre compte est désactivé.');
        }

        // Les super-admins ont accès à toutes les routes
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (empty($roles)) {
            return $next($request);
        }

        if (! in_array($user->role, $roles)) {
            abort(403, 'Accès refusé. Rôle requis : '.implode(', ', $roles));
        }

        return $next($request);
    }
}
