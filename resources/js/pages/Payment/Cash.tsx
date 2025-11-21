import { Head, Link, router } from '@inertiajs/react';
import * as paymentRoutes from '@/routes/payment';
import { dashboard } from '@/routes';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Clock, CheckCircle, XCircle, Smartphone, CreditCard, ArrowLeftRight, Mail, Phone, ArrowRight } from 'lucide-react';
import AuthLayout from '@/layouts/auth-layout';

interface Abonnement {
    id: number;
    plan: string;
    montant: number | string;
    statut_paiement: string;
    statut?: string;
    est_actif?: boolean;
    date_fin?: string | null;
    mode_paiement?: string;
}

interface Props {
    abonnement: Abonnement;
}

export default function CashPayment({ abonnement }: Props) {
    const [showChangeMethod, setShowChangeMethod] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const modesPaiement = [
        { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
        { value: 'carte_bancaire', label: 'Carte Bancaire', icon: CreditCard },
        { value: 'espece', label: 'Espèce', icon: Wallet },
    ];

    const handleChangeMethod = (mode: string) => {
        setIsChanging(true);
        router.post(paymentRoutes.changeMethod().url, { mode_paiement: mode }, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: (page) => {
                setShowChangeMethod(false);
                setIsChanging(false);
            },
            onError: (errors) => {
                console.error('Erreur lors du changement de mode de paiement:', errors);
                setIsChanging(false);
            },
            onFinish: () => {
                setIsChanging(false);
            },
        });
    };

    const getPlanName = (plan: string) => {
        const plans: Record<string, string> = {
            simple: 'Starter',
            medium: 'Business',
            premium: 'Pro',
        };
        return plans[plan] || plan;
    };

    const formatMontant = (montant: number | string | undefined | null): string => {
        if (!montant) {
            return '0.00';
        }
        const numMontant = typeof montant === 'number' ? montant : parseFloat(String(montant));
        return isNaN(numMontant) ? '0.00' : numMontant.toFixed(2);
    };

    const getStatusInfo = (statutPaiement: string, statut?: string) => {
        // Vérifier d'abord le statut de l'abonnement (suspendu, annulé, expiré)
        if (statut === 'suspendu') {
            return {
                icon: XCircle,
                color: 'text-orange-600 dark:text-orange-400',
                bgColor: 'bg-orange-50 dark:bg-orange-950',
                borderColor: 'border-orange-200 dark:border-orange-800',
                title: 'Abonnement suspendu',
                message: 'Votre abonnement a été suspendu. Veuillez contacter le support pour plus d\'informations ou renouveler votre abonnement.',
                canChangeMethod: true,
            };
        }

        if (statut === 'annule') {
            return {
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bgColor: 'bg-red-50 dark:bg-red-950',
                borderColor: 'border-red-200 dark:border-red-800',
                title: 'Abonnement annulé',
                message: 'Votre abonnement a été annulé. Vous pouvez créer un nouvel abonnement en choisissant un mode de paiement.',
                canChangeMethod: true,
            };
        }

        if (statut === 'expire') {
            return {
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bgColor: 'bg-red-50 dark:bg-red-950',
                borderColor: 'border-red-200 dark:border-red-800',
                title: 'Abonnement expiré',
                message: 'Votre abonnement a expiré. Veuillez renouveler votre abonnement pour continuer à utiliser nos services.',
                canChangeMethod: true,
            };
        }

        // Ensuite vérifier le statut du paiement
        switch (statutPaiement) {
            case 'valide':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-50 dark:bg-green-950',
                    borderColor: 'border-green-200 dark:border-green-800',
                    title: 'Paiement validé',
                    message: 'Votre paiement a été validé par l\'administrateur. Vous pouvez maintenant accéder à votre compte.',
                    canChangeMethod: false,
                };
            case 'refuse':
                return {
                    icon: XCircle,
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-950',
                    borderColor: 'border-red-200 dark:border-red-800',
                    title: 'Paiement refusé',
                    message: 'Votre paiement a été refusé. Vous pouvez changer de mode de paiement ou contacter le support pour plus d\'informations.',
                    canChangeMethod: true,
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    title: 'En attente de validation',
                    message: 'Votre paiement en espèce est en attente de validation par un administrateur. Vous recevrez une notification une fois le paiement validé.',
                    canChangeMethod: true,
                };
        }
    };

    const statusInfo = getStatusInfo(abonnement.statut_paiement, abonnement.statut);
    const StatusIcon = statusInfo.icon;
    const canChangeMethod = statusInfo.canChangeMethod ?? false;
    const isAbonnementInactive = abonnement.statut === 'suspendu' || abonnement.statut === 'annule' || abonnement.statut === 'expire';

    return (
        <AuthLayout
            title="Paiement en Espèce"
            description="En attente de validation"
        >
            <Head title="Paiement en Espèce" />
            <div className="w-full max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <Wallet className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Paiement en Espèce</CardTitle>
                                    <CardDescription>
                                        Plan {getPlanName(abonnement.plan)} - ${formatMontant(abonnement.montant)}/mois
                                    </CardDescription>
                                </div>
                            </div>
                            {canChangeMethod && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowChangeMethod(true)}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeftRight className="h-4 w-4" />
                                    Changer
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`mb-6 p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                            <div className="flex items-start gap-3">
                                <StatusIcon className={`h-5 w-5 ${statusInfo.color} mt-0.5`} />
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${statusInfo.color}`}>
                                        {statusInfo.title}
                                    </p>
                                    <p className={`text-xs ${statusInfo.color} mt-1 opacity-90`}>
                                        {statusInfo.message}
                                    </p>
                                    {abonnement.statut_paiement === 'valide' && (
                                        <Link
                                            href={dashboard().url}
                                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                        >
                                            <span>Accéder au dashboard</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isAbonnementInactive && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-muted">
                                    <h3 className="text-sm font-semibold mb-2">Instructions de paiement</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Effectuez le paiement en espèce auprès de l'administrateur</li>
                                        <li>Montant à payer : <strong>${formatMontant(abonnement.montant)}</strong></li>
                                        <li>Présentez votre numéro de transaction ou votre email</li>
                                        <li>Un administrateur validera votre paiement sous 24-48h</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-lg bg-muted">
                                    <h3 className="text-sm font-semibold mb-3">Contactez le support</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Pour toute question concernant votre paiement, notre équipe de support est à votre disposition.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href="mailto:support@payway.com"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>support@payway.com</span>
                                        </a>
                                        <a
                                            href="tel:+243900000000"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Phone className="h-4 w-4" />
                                            <span>+243 900 000 000</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAbonnementInactive && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-muted">
                                    <h3 className="text-sm font-semibold mb-2">Actions disponibles</h3>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold">•</span>
                                            <span>Vous pouvez changer de mode de paiement en cliquant sur le bouton "Changer" ci-dessus</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold">•</span>
                                            <span>Pour renouveler votre abonnement, choisissez un nouveau mode de paiement</span>
                                        </li>
                                        {abonnement.date_fin && (
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">•</span>
                                                <span>Date d'expiration : <strong>{new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}</strong></span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-lg bg-muted">
                                    <h3 className="text-sm font-semibold mb-3">Besoin d'aide ?</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Notre équipe de support est disponible pour vous accompagner.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href="mailto:support@payway.com"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>support@payway.com</span>
                                        </a>
                                        <a
                                            href="tel:+243900000000"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Phone className="h-4 w-4" />
                                            <span>+243 900 000 000</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {abonnement.statut_paiement === 'en_attente' && !isAbonnementInactive && (
                            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                                    <Clock className="h-4 w-4" />
                                    <span>Vous recevrez un email de confirmation une fois le paiement validé</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog pour changer de mode de paiement */}
                {canChangeMethod && (
                    <Dialog open={showChangeMethod} onOpenChange={setShowChangeMethod}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Changer de mode de paiement</DialogTitle>
                                <DialogDescription>
                                    {isAbonnementInactive
                                        ? 'Sélectionnez un mode de paiement pour renouveler votre abonnement'
                                        : 'Sélectionnez un autre mode de paiement pour votre abonnement'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 py-4">
                                {modesPaiement
                                    .filter((mode) => mode.value !== 'espece')
                                    .map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() => handleChangeMethod(mode.value)}
                                                disabled={isChanging}
                                                className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <span className="font-medium">
                                                    {isChanging ? 'Changement en cours...' : mode.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AuthLayout>
    );
}

