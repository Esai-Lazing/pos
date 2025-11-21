import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import * as paymentRoutes from '@/routes/payment';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SubscriptionExpiredDialog() {
    const page = usePage<SharedData>();
    const flash = page.props.flash;
    const { auth, restaurant } = page.props;
    const [isOpen, setIsOpen] = useState(false);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    // Vérifier si l'utilisateur est admin
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'super-admin';
    const restaurantName = restaurant?.nom || 'votre restaurant';

    useEffect(() => {
        // Ne pas afficher le dialog si on est déjà sur la page de paiement
        if (currentUrl.includes('/payment')) {
            setIsOpen(false);
            return;
        }

        // Vérifier si le flag subscription_expired est présent ou si le message d'erreur concerne l'abonnement expiré
        if (
            flash?.subscription_expired === true ||
            (flash?.error && flash.error.includes('abonnement a expiré'))
        ) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [flash?.subscription_expired, flash?.error, currentUrl]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-xl">Abonnement expiré</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2 text-base">
                        {flash?.error || 'Votre abonnement a expiré. Veuillez renouveler votre abonnement pour continuer à utiliser nos services.'}
                    </DialogDescription>
                </DialogHeader>

                {isAdmin && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                Pour renouveler votre abonnement, vous serez redirigé vers la page de paiement où vous pourrez choisir votre mode de paiement préféré.
                            </p>
                        </div>
                    </div>
                )}

                {!isAdmin && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                Veuillez contacter l'administrateur de <strong>{restaurantName}</strong> pour renouveler l'abonnement.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {isAdmin ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Plus tard
                            </Button>
                            <Button
                                asChild
                                className="w-full sm:w-auto"
                            >
                                <Link
                                    href={paymentRoutes.show().url}
                                    className="flex items-center gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Renouveler l'abonnement
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Compris
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

