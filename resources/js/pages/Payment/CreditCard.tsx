import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CreditCard, Lock, Smartphone, Wallet, ArrowLeftRight, CheckCircle2, Loader2 } from 'lucide-react';
import AuthLayout from '@/layouts/auth-layout';
import { loadStripe } from '@stripe/stripe-js';

interface Abonnement {
    id: number;
    plan: string;
    montant: number | string;
}

interface Props {
    abonnement: Abonnement;
    stripe_key?: string;
    checkout_session_id?: string;
    checkout_url?: string;
    stripe_error?: string;
}

export default function CreditCardPayment({ abonnement, stripe_key, checkout_url, stripe_error }: Props) {
    const [showChangeMethod, setShowChangeMethod] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [stripe, setStripe] = useState<any>(null);

    useEffect(() => {
        if (stripe_key && typeof window !== 'undefined') {
            loadStripe(stripe_key).then((stripeInstance) => {
                setStripe(stripeInstance);
            });
        }
    }, [stripe_key]);

    const modesPaiement = [
        { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-blue-500' },
        { value: 'carte_bancaire', label: 'Carte Bancaire', icon: CreditCard, color: 'bg-purple-500' },
        { value: 'espece', label: 'Espèce', icon: Wallet, color: 'bg-green-500' },
    ];

    const handleChangeMethod = (mode: string) => {
        router.post('/payment/change-method', { mode_paiement: mode }, {
            onSuccess: () => {
                setShowChangeMethod(false);
            },
        });
    };

    const handleStripeCheckout = async () => {
        if (checkout_url) {
            window.location.href = checkout_url;
            return;
        }

        setProcessing(true);
        // Si pas de checkout_url, on peut créer une session via une requête
        // Pour l'instant, on redirige vers la page de paiement
        router.visit('/payment');
    };

    const montant = typeof abonnement.montant === 'number'
        ? abonnement.montant.toFixed(2)
        : parseFloat(abonnement.montant).toFixed(2);

    return (
        <AuthLayout
            title=""
            description=""
        >
            <Head title="Paiement par Carte Bancaire" />
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-xl space-y-6">
                    {/* Header avec bouton changer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Paiement par Carte Bancaire
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Paiement sécurisé via Stripe
                            </p>
                        </div>
                        <Dialog open={showChangeMethod} onOpenChange={setShowChangeMethod}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowLeftRight className="h-4 w-4" />
                                    Changer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Changer de mode de paiement</DialogTitle>
                                    <DialogDescription>
                                        Sélectionnez un autre mode de paiement
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3 py-4">
                                    {modesPaiement
                                        .filter((mode) => mode.value !== 'carte_bancaire')
                                        .map((mode) => {
                                            const Icon = mode.icon;
                                            return (
                                                <button
                                                    key={mode.value}
                                                    onClick={() => handleChangeMethod(mode.value)}
                                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
                                                >
                                                    <div className={`p-3 rounded-lg ${mode.color} text-white`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {mode.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Carte principale */}
                    <Card className="border-2 p-0">
                        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Plan {abonnement.plan}</CardTitle>
                                    <CardDescription className="text-purple-100 mt-1">
                                        Abonnement mensuel
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">${montant}</div>
                                    <div className="text-sm text-purple-100">USD / mois</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Message d'erreur Stripe */}
                                {stripe_error && (
                                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-red-900 dark:text-red-100">
                                                Erreur de configuration Stripe
                                            </p>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                {stripe_error}
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                                Veuillez contacter l'administrateur ou utiliser un autre mode de paiement.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Informations de sécurité */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Paiement sécurisé
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            Vos informations de paiement sont cryptées et sécurisées par Stripe.
                                            Nous ne stockons jamais vos données de carte bancaire.
                                        </p>
                                    </div>
                                </div>

                                {/* Avantages */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Avantages de votre abonnement :
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            'Paiement sécurisé via Stripe',
                                            'Renouvellement automatique',
                                            'Support client 24/7',
                                            'Factures disponibles',
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Bouton de paiement */}
                                <Button
                                    onClick={handleStripeCheckout}
                                    disabled={processing || !checkout_url || !!stripe_error}
                                    className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="lg"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-5 w-5" />
                                            Payer ${montant} avec Stripe
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    En cliquant sur "Payer", vous serez redirigé vers la page de paiement sécurisée de Stripe.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations supplémentaires */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        Cartes acceptées
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Visa, Mastercard, American Express, et plus encore via Stripe.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}
