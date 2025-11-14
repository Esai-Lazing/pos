import { usePage } from '@inertiajs/react';
import { AlertCircle, X } from 'lucide-react';
import { type SharedData, type SubscriptionNotification } from '@/types';
import { Link } from '@inertiajs/react';

export default function SubscriptionNotifications() {
    const { subscriptionNotifications } = usePage<SharedData>().props;

    if (!subscriptionNotifications || subscriptionNotifications.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {subscriptionNotifications.map((notification) => (
                <div
                    key={`${notification.type}-${notification.restaurant.id}-${notification.abonnement.id}`}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                        notification.type === 'expired'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-yellow-500 bg-yellow-500/10'
                    }`}
                >
                    <AlertCircle
                        className={`h-5 w-5 flex-shrink-0 ${
                            notification.type === 'expired' ? 'text-red-500' : 'text-yellow-500'
                        }`}
                    />
                    <div className="flex-1">
                        <p
                            className={`text-sm font-semibold ${
                                notification.type === 'expired' ? 'text-red-500' : 'text-yellow-500'
                            }`}
                        >
                            {notification.type === 'expired' ? 'Abonnement expiré' : 'Abonnement expire bientôt'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        {notification.type === 'expiring' && notification.days_until_expiration !== undefined && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {notification.days_until_expiration === 0
                                    ? "Expire aujourd'hui"
                                    : `Expire dans ${notification.days_until_expiration} jour(s)`}
                            </p>
                        )}
                        <Link
                            href={`/restaurant/${notification.restaurant.id}/abonnement/edit`}
                            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Gérer l'abonnement →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

