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
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $notifications = [];
        $restaurant = null;
        $restaurantCustomization = null;

        // Ajouter les notifications d'abonnement pour les super-admins
        if ($user && $user->isSuperAdmin()) {
            $notificationService = new AbonnementNotificationService();
            $notifications = $notificationService->getExpiringSubscriptions(7);
        } elseif ($user && $user->restaurant_id) {
            // Pour les admins de restaurant, afficher les notifications de leur restaurant
            $notificationService = new AbonnementNotificationService();
            $notifications = $notificationService->getNotificationsForRestaurant($user->restaurant_id, 7);

            // Charger le restaurant et sa personnalisation
            $restaurant = $user->restaurant;
            if ($restaurant) {
                $restaurant->load('customization');
                $restaurantCustomization = $restaurant->customization;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
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
                ] : null,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'admin_credentials' => $request->session()->get('admin_credentials'),
            ],
            'subscriptionNotifications' => $notifications,
        ];
    }
}
