import AppLayout from '@/layouts/app-layout';
import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as subscriptionRoutes from '@/routes/subscription';
import * as serveurRoutes from '@/routes/serveur';

const getPlanName = (plan: string | null) => {
    if (!plan) {
        return 'N/A';
    }
    const plans: Record<string, string> = {
        simple: 'Starter',
        medium: 'Business',
        premium: 'Pro',
    };
    return plans[plan] || plan;
};

export default function ServeurCreate() {
    const [pinCode, setPinCode] = useState('');
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    
    const page = usePage();
    const props = page.props as {
        flash?: Record<string, unknown>;
        errors?: Record<string, unknown>;
        limit_reached?: boolean;
        limit_message?: string;
        current_plan?: string;
        current_serveurs?: number;
        max_serveurs?: number;
    };

    const flash = props.flash;
    const errors = props.errors;

    const limitReached = props.limit_reached ?? (flash?.limit_reached === true || flash?.limit_reached === '1' || flash?.limit_reached === 1);
    const limitMessage = props.limit_message ?? (flash?.limit_message ? String(flash.limit_message) : '');
    const currentPlan = props.current_plan ?? (flash?.current_plan ? String(flash.current_plan) : '');
    const currentServeurs = props.current_serveurs ?? (flash?.current_serveurs ? Number(flash.current_serveurs) : 0);
    const maxServeurs = props.max_serveurs ?? (flash?.max_serveurs ? Number(flash.max_serveurs) : 0);

    useEffect(() => {
        if (limitReached) {
            setShowUpgradeDialog(true);
        }
    }, [limitReached]);

    const generatePin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setPinCode(pin);
    };

    return (
        <AppLayout>
            <Head title="Créer un serveur" />
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={serveurRoutes.index().url}
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nouveau Serveur</h1>
                        <p className="text-muted-foreground">Créer un nouveau compte serveur avec un code PIN à 4 chiffres</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <Form 
                        action={serveurRoutes.store().url}
                        method="post" 
                        className="space-y-6"
                        onError={(formErrors) => {
                            if (formErrors.limit_reached) {
                                setShowUpgradeDialog(true);
                            }
                        }}
                    >
                        {({ errors: formErrors, processing }) => (
                            <>
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                        Nom du serveur *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                            formErrors.name ? 'border-red-500' : 'border-input bg-background'
                                        }`}
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                    )}
                                </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="pin_code" className="block text-sm font-medium">
                                    Code PIN (4 chiffres) *
                                </label>
                                <button
                                    type="button"
                                    onClick={generatePin}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Générer automatiquement
                                </button>
                            </div>
                            <input
                                type="text"
                                id="pin_code"
                                name="pin_code"
                                value={pinCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setPinCode(value);
                                }}
                                required
                                maxLength={4}
                                pattern="[0-9]{4}"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0000"
                            />
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ce code sera utilisé par le serveur pour se connecter
                                </p>
                                {formErrors.pin_code && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.pin_code}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={pinCode.length !== 4 || processing}
                                    className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Création...' : 'Créer le serveur'}
                                </button>
                                <Link
                                    href={serveurRoutes.index().url}
                                    className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                                >
                                    Annuler
                                </Link>
                            </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>

            {/* Dialog pour l'upgrade d'abonnement */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <DialogTitle className="text-xl">Limite de serveurs atteinte</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            {limitMessage || `Vous avez atteint la limite de serveurs de votre plan actuel (${currentServeurs}/${maxServeurs}).`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Plan actuel :
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {getPlanName(currentPlan)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Serveurs :
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {currentServeurs} / {maxServeurs}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Pour créer plus de serveurs, vous devez upgrader votre abonnement vers un plan supérieur qui offre plus de flexibilité.
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowUpgradeDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                        <Button
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link href={subscriptionRoutes.index().url} className="flex items-center gap-2">
                                Voir les plans disponibles
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

