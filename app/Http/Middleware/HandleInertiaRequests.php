<?php

namespace App\Http\Middleware;

use App\Services\AbonnementNotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // S'assurer que la locale est définie avant de charger les traductions
        app()->setLocale(config('app.locale', 'fr'));

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $notifications = [];
        $restaurant = null;
        $restaurantCustomization = null;

        // Ajouter les notifications d'abonnement pour les super-admins
        if ($user && $user->isSuperAdmin()) {
            $notificationService = new AbonnementNotificationService;
            $notifications = $notificationService->getExpiringSubscriptions(7);
        } elseif ($user && $user->restaurant_id) {
            // Pour les admins de restaurant, afficher les notifications de leur restaurant
            $notificationService = new AbonnementNotificationService;
            $notifications = $notificationService->getNotificationsForRestaurant($user->restaurant_id, 7);

            // Charger le restaurant et sa personnalisation
            $restaurant = $user->restaurant;
            if ($restaurant) {
                $restaurant->load(['customization', 'abonnement']);
                $restaurantCustomization = $restaurant->customization;
            }
        }

        // Récupérer les limitations de l'abonnement pour le restaurant
        $subscriptionLimitations = null;
        if ($restaurant && $restaurant->hasActiveSubscription()) {
            $abonnement = $restaurant->abonnement;
            if ($abonnement) {
                $subscriptionLimitations = $abonnement->getLimitations();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'translations' => [
                'common' => trans('common'),
                'stock' => trans('stock'),
                'sales' => trans('sales'),
                'reports' => trans('reports'),
                'printer' => trans('printer'),
                'auth' => trans('auth'),
                'validation' => trans('validation'),
            ],
            'auth' => [
                'user' => $user,
            ],
            'restaurant' => $restaurant ? [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
                'email' => $restaurant->email,
                'telephone' => $restaurant->telephone,
                'customization' => $restaurantCustomization ? [
                    'logo' => $restaurantCustomization->logo ? Storage::disk('public')->url($restaurantCustomization->logo) : null,
                    'nom' => $restaurant->nom,
                    'adresse' => $restaurantCustomization->adresse,
                    'ville' => $restaurantCustomization->ville,
                    'pays' => $restaurantCustomization->pays,
                    'couleur_principale' => $restaurantCustomization->couleur_principale,
                    'primary_color' => $restaurantCustomization->primary_color ?? $restaurantCustomization->couleur_principale,
                    'secondary_color' => $restaurantCustomization->secondary_color,
                    'font_family' => $restaurantCustomization->font_family,
                    'font_size' => $restaurantCustomization->font_size,
                    'theme' => $restaurantCustomization->theme ?? 'default',
                ] : null,
                'subscriptionLimitations' => $subscriptionLimitations,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'admin_credentials' => $request->session()->get('admin_credentials'),
                // Flash messages personnalisés pour les limites d'abonnement
                'limit_reached' => $request->session()->get('limit_reached'),
                'limit_message' => $request->session()->get('limit_message'),
                'current_plan' => $request->session()->get('current_plan'),
                'current_users' => $request->session()->get('current_users'),
                'max_users' => $request->session()->get('max_users'),
                // Flag pour l'abonnement expiré
                'subscription_expired' => $request->session()->get('subscription_expired', false),
            ],
            'subscriptionNotifications' => $notifications,
        ];
    }
}
