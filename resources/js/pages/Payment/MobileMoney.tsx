import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Smartphone, CreditCard, Wallet, ArrowLeftRight, CheckCircle2, Clock, Loader2, Phone } from 'lucide-react';
import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

interface Abonnement {
    id: number;
    plan: string;
    montant: number | string;
    otp_sent?: boolean;
    otp_expires_at?: string;
    transaction_id?: string;
    payment_url?: string;
}

interface Provider {
    name: string;
    enabled: boolean;
}

interface Props {
    abonnement: Abonnement;
    provider?: string;
    available_providers?: {
        airtel_money?: Provider;
        orange_money?: Provider;
    };
}

export default function MobileMoneyPayment({
    abonnement,
    provider: initialProvider = 'orange_money',
    available_providers = {}
}: Props) {
    const [showChangeMethod, setShowChangeMethod] = useState(false);
    const [resending, setResending] = useState(false);
    const [showPhoneForm, setShowPhoneForm] = useState(!abonnement.otp_sent);
    const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider);
    const [showProviderSelection, setShowProviderSelection] = useState(false);

    const phoneForm = useForm({
        phone_number: '',
        provider: selectedProvider,
    });

    const otpForm = useForm({
        otp_code: '',
    });

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

    const handleInitiatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        phoneForm.setData('provider', selectedProvider);
        phoneForm.post('/payment/initiate-mobile-money', {
            onSuccess: () => {
                setShowPhoneForm(false);
            },
        });
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        otpForm.post('/payment/verify-otp', {
            onSuccess: () => {
                router.visit('/dashboard');
            },
        });
    };

    const handleResendOtp = () => {
        if (!phoneForm.data.phone_number) {
            return;
        }

        setResending(true);
        router.post('/payment/resend-otp', { phone_number: phoneForm.data.phone_number }, {
            onSuccess: () => {
                setResending(false);
            },
            onError: () => {
                setResending(false);
            },
        });
    };

    // Rediriger vers l'URL de paiement si disponible (Orange Money)
    useEffect(() => {
        if (abonnement.payment_url && selectedProvider === 'orange_money') {
            // Optionnel : rediriger automatiquement vers la page de paiement Orange Money
            // window.location.href = abonnement.payment_url;
        }
    }, [abonnement.payment_url, selectedProvider]);

    const getPlanName = (plan: string) => {
        const plans: Record<string, string> = {
            simple: 'Starter',
            medium: 'Business',
            premium: 'Pro',
        };
        return plans[plan] || plan;
    };

    const getProviderName = (providerName?: string) => {
        const prov = providerName || selectedProvider;
        return prov === 'airtel_money' ? 'Airtel Money' : 'Orange Money';
    };

    const enabledProviders = Object.entries(available_providers || {})
        .filter(([_, provider]) => provider?.enabled)
        .map(([key, provider]) => ({ key, ...provider }));

    const hasMultipleProviders = enabledProviders.length > 1;

    const montant = typeof abonnement.montant === 'number'
        ? abonnement.montant.toFixed(2)
        : parseFloat(abonnement.montant).toFixed(2);

    return (
        <AuthLayout
            title="Paiement Mobile Money"
            description={`Confirmez votre paiement avec ${getProviderName()}`}
        >
            <Head title={`Paiement ${getProviderName()}`} />
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-lg space-y-6">
                    {/* Header avec bouton changer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Paiement {getProviderName()}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                {showPhoneForm
                                    ? 'Entrez votre numéro de téléphone pour initier le paiement'
                                    : 'Confirmez votre paiement avec le code OTP'}
                            </p>
                            {/* Sélection du provider si plusieurs disponibles */}
                            {hasMultipleProviders && showPhoneForm && (
                                <div className="mt-3 flex gap-2">
                                    {enabledProviders.map((prov) => (
                                        <button
                                            key={prov.key}
                                            type="button"
                                            onClick={() => setSelectedProvider(prov.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedProvider === prov.key
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {prov.name}
                                        </button>
                                    ))}
                                </div>
                            )}
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
                                        .filter((mode) => mode.value !== 'mobile_money')
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
                    <Card className="border-2 shadow-xl p-0">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Plan {getPlanName(abonnement.plan)}</CardTitle>
                                    <CardDescription className="text-blue-100 mt-1">
                                        Abonnement mensuel
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">${montant}</div>
                                    <div className="text-sm text-blue-100">USD / mois</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Formulaire de numéro de téléphone */}
                                {showPhoneForm && (
                                    <>
                                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                                    Initier le paiement
                                                </p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                    Entrez votre numéro de téléphone {getProviderName()} pour recevoir un code de confirmation.
                                                    {selectedProvider === 'airtel_money' && (
                                                        <span className="block mt-1 text-xs">
                                                            Vous devrez entrer votre PIN Airtel Money pour confirmer le paiement.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleInitiatePayment} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number" className="text-base font-semibold">
                                                    Numéro de téléphone
                                                </Label>
                                                <Input
                                                    id="phone_number"
                                                    type="tel"
                                                    value={phoneForm.data.phone_number}
                                                    onChange={(e) => phoneForm.setData('phone_number', e.target.value)}
                                                    placeholder="+243 900 000 000"
                                                    className="text-lg h-12"
                                                    autoFocus
                                                />
                                                <InputError message={phoneForm.errors.phone_number} />
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Format: +243 900 000 000 ou 0900 000 000
                                                </p>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={phoneForm.processing || !phoneForm.data.phone_number}
                                                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                                                size="lg"
                                            >
                                                {phoneForm.processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Traitement...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Smartphone className="mr-2 h-5 w-5" />
                                                        Initier le paiement
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </>
                                )}

                                {/* Formulaire OTP */}
                                {!showPhoneForm && (
                                    <>
                                        {/* Message OTP envoyé */}
                                        {abonnement.otp_sent && (
                                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-green-900 dark:text-green-100">
                                                        Code OTP envoyé
                                                    </p>
                                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                        Un code de confirmation à 6 chiffres a été envoyé à votre numéro {getProviderName()}.
                                                        {abonnement.otp_expires_at && (
                                                            <span className="block mt-1">
                                                                Expire dans 10 minutes.
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Lien de paiement (Orange Money ou Airtel Money) */}
                                        {abonnement.payment_url && (
                                            <div className={`p-4 rounded-lg border ${selectedProvider === 'orange_money'
                                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                }`}>
                                                <p className={`text-sm mb-2 ${selectedProvider === 'orange_money'
                                                    ? 'text-orange-900 dark:text-orange-100'
                                                    : 'text-blue-900 dark:text-blue-100'
                                                    }`}>
                                                    <strong>Action requise :</strong> Complétez votre paiement sur la page {getProviderName()}
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        if (abonnement.payment_url) {
                                                            window.open(abonnement.payment_url, '_blank');
                                                        }
                                                    }}
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    Ouvrir la page de paiement {getProviderName()}
                                                </Button>
                                            </div>
                                        )}

                                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="otp_code" className="text-base font-semibold">
                                                    Code de confirmation (OTP)
                                                </Label>
                                                <Input
                                                    id="otp_code"
                                                    type="text"
                                                    maxLength={6}
                                                    value={otpForm.data.otp_code}
                                                    onChange={(e) => otpForm.setData('otp_code', e.target.value.replace(/\D/g, ''))}
                                                    placeholder="000000"
                                                    className="text-center text-3xl font-mono tracking-widest h-16"
                                                    autoFocus
                                                />
                                                <InputError message={otpForm.errors.otp_code} />
                                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                                    Entrez le code à 6 chiffres reçu par SMS
                                                </p>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={otpForm.processing || otpForm.data.otp_code.length !== 6}
                                                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                                                size="lg"
                                            >
                                                {otpForm.processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Vérification...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                                        Confirmer le paiement
                                                    </>
                                                )}
                                            </Button>
                                        </form>

                                        {/* Bouton renvoyer OTP */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleResendOtp}
                                                disabled={resending || !phoneForm.data.phone_number}
                                                className="w-full"
                                            >
                                                {resending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Envoi en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        Renvoyer le code OTP
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations supplémentaires */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        Paiement sécurisé via {getProviderName()}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Votre paiement est sécurisé via {getProviderName()}. Le code OTP est valide pendant 10 minutes.
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
