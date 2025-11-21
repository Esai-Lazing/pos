<?php

namespace App\Services;

use App\Models\Abonnement;

class AbonnementNotificationService
{
    /**
     * Récupère les abonnements expirés ou sur le point d'expirer
     */
    public function getExpiringSubscriptions(int $daysBeforeExpiration = 7): array
    {
        $notifications = [];

        // Abonnements expirés
        $expired = Abonnement::where('est_actif', true)
            ->where('statut', 'actif')
            ->whereNotNull('date_fin')
            ->where('date_fin', '<', now())
            ->with('restaurant')
            ->get();

        foreach ($expired as $abonnement) {
            $notifications[] = [
                'type' => 'expired',
                'restaurant' => $abonnement->restaurant,
                'abonnement' => $abonnement,
                'message' => "L'abonnement de {$abonnement->restaurant->nom} a expiré le {$abonnement->date_fin->format('d/m/Y')}.",
            ];
        }

        // Abonnements sur le point d'expirer
        $expiring = Abonnement::where('est_actif', true)
            ->where('statut', 'actif')
            ->whereNotNull('date_fin')
            ->whereBetween('date_fin', [now(), now()->addDays($daysBeforeExpiration)])
            ->with('restaurant')
            ->get();

        foreach ($expiring as $abonnement) {
            $daysUntilExpiration = now()->diffInDays($abonnement->date_fin);
            $notifications[] = [
                'type' => 'expiring',
                'restaurant' => $abonnement->restaurant,
                'abonnement' => $abonnement,
                'message' => "L'abonnement de {$abonnement->restaurant->nom} expire dans {$daysUntilExpiration} jour(s) ({$abonnement->date_fin->format('d/m/Y')}).",
                'days_until_expiration' => $daysUntilExpiration,
            ];
        }

        return $notifications;
    }

    /**
     * Récupère les notifications pour un restaurant spécifique
     */
    public function getNotificationsForRestaurant(int $restaurantId, int $daysBeforeExpiration = 7): array
    {
        $allNotifications = $this->getExpiringSubscriptions($daysBeforeExpiration);

        return array_filter($allNotifications, function ($notification) use ($restaurantId) {
            return $notification['restaurant']->id === $restaurantId;
        });
    }
}
