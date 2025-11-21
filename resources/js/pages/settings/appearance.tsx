import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type SharedData } from '@/types';
import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface AppearanceProps {
    hasAccess?: boolean;
}

export default function Appearance({ hasAccess = false }: AppearanceProps) {
    const { auth, restaurant } = usePage<SharedData>().props;

    useEffect(() => {
        // Rediriger vers la page de personnalisation si l'utilisateur a accès
        if (hasAccess) {
            router.visit('/restaurant/customization/edit', {
                preserveState: false,
                preserveScroll: false,
            });
        }
    }, [hasAccess]);

    // Si l'utilisateur a accès, afficher le message de redirection
    if (hasAccess) {
        return (
            <AppLayout>
                <Head title="Paramètres d'apparence" />
                <SettingsLayout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <p className="text-muted-foreground">Redirection vers la personnalisation...</p>
                    </div>
                </SettingsLayout>
            </AppLayout>
        );
    }

    // Si l'utilisateur n'a pas accès, afficher un message clair
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'super-admin';
    const hasSubscription = restaurant?.subscriptionLimitations?.personnalisation ?? false;

    return (
        <AppLayout>
            <Head title="Paramètres d'apparence" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Paramètres d'apparence"
                        description="Personnalisez l'apparence de votre restaurant"
                    />

                    <Alert variant="destructive">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Accès restreint</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                            {!isAdmin ? (
                                <p>
                                    La personnalisation de l'apparence est réservée aux administrateurs de {restaurant?.nom || 'ce restaurant'}.
                                    Contactez votre administrateur pour accéder à cette fonctionnalité.
                                </p>
                            ) : !hasSubscription ? (
                                <p>
                                    La personnalisation de l'apparence n'est pas incluse dans votre abonnement actuel.
                                    Veuillez mettre à jour votre abonnement pour accéder à cette fonctionnalité.
                                </p>
                            ) : (
                                <p>
                                    Vous n'avez pas accès à cette fonctionnalité. Contactez le support pour plus d'informations.
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
