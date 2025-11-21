import AppLayout from '@/layouts/app-layout';
import * as subscriptionRoutes from '@/routes/subscription';
import * as paymentRoutes from '@/routes/payment';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    CheckCircle2,
    Clock,
    XCircle,
    DollarSign,
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    CreditCard,
    Wallet,
    Receipt,
    Calendar,
    ArrowRight,
    ArrowLeftRight,
    Smartphone,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Abonnement',
        href: subscriptionRoutes.index().url,
    },
];

const getPlanName = (plan: string | null) => {
    if (!plan) {
        return 'Aucun plan';
    }
    const plans: Record<string, string> = {
        simple: 'Starter',
        medium: 'Business',
        premium: 'Pro',
    };
    return plans[plan] || plan;
};

interface Abonnement {
    id: number;
    plan: string;
    montant_mensuel: number;
    mode_paiement: string;
    statut_paiement: string;
    statut: string;
    est_actif: boolean;
    date_debut: string;
    date_fin: string | null;
    created_at: string;
}

interface Invoice {
    id: number;
    numero: string;
    montant: number;
    statut: string;
    date_emission: string;
    date_echeance: string | null;
}

interface PaymentTransaction {
    id: number;
    transaction_id: string;
    montant: number;
    provider: string;
    status: string;
    created_at: string;
}

interface Usage {
    users: {
        current: number;
        limit: number | null;
        percentage: number;
    };
    serveurs?: {
        current: number;
        limit: number | null;
        percentage: number;
    };
    products: {
        current: number;
        limit: number | null;
        percentage: number;
    };
    sales: {
        current: number;
        limit: number | null;
        percentage: number;
    };
}

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    limitations: {
        max_users?: number;
        max_produits?: number;
        max_ventes_mois?: number;
    };
}

interface Props {
    abonnement: Abonnement | null;
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    transactions: {
        data: PaymentTransaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    usage: Usage;
    plans: SubscriptionPlan[] | Record<string, SubscriptionPlan>;
}

const getStatusBadge = (statut: string, statutPaiement: string) => {
    if (statutPaiement === 'valide' && statut === 'actif') {
        return (
            <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Actif
            </Badge>
        );
    }
    if (statutPaiement === 'refuse') {
        return (
            <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Refusé
            </Badge>
        );
    }
    return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            En attente
        </Badge>
    );
};

const getPaymentMethodIcon = (mode: string) => {
    switch (mode) {
        case 'credit_card':
            return <CreditCard className="h-4 w-4" />;
        case 'cash':
            return <Wallet className="h-4 w-4" />;
        case 'mobile_money':
            return <DollarSign className="h-4 w-4" />;
        default:
            return <CreditCard className="h-4 w-4" />;
    }
};

const getPaymentMethodLabel = (mode: string) => {
    switch (mode) {
        case 'credit_card':
            return 'Carte bancaire';
        case 'cash':
            return 'Espèces';
        case 'mobile_money':
            return 'Mobile Money';
        default:
            return mode;
    }
};

export default function SubscriptionIndex({
    abonnement,
    invoices,
    transactions,
    usage,
    plans,
}: Props) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<{
        id: string;
        name: string;
        price: number;
    } | null>(null);
    const [planToUpdate, setPlanToUpdate] = useState<{
        id: string;
        name: string;
        price: number;
    } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        plan: '',
        mode_paiement: '',
    });

    const formatDate = (date: string | null) => {
        if (!date) {
            return 'N/A';
        }
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Obtenir le montant du plan actuel depuis les plans prédéfinis
    const getCurrentPlanAmount = (): number => {
        if (!abonnement || !abonnement.plan) {
            return 0;
        }

        // Les plans peuvent être un objet Record ou un array
        const plansObj: Record<string, any> = Array.isArray(plans)
            ? plans.reduce((acc: Record<string, any>, plan: any) => {
                const key = (plan as any).slug || plan.id || plan.name?.toLowerCase();
                return { ...acc, [key]: plan };
            }, {})
            : (plans as Record<string, any>);

        const currentPlan = plansObj[abonnement.plan];

        // Le plan peut avoir 'montant_mensuel' ou 'price'
        if (currentPlan) {
            return (currentPlan as any).montant_mensuel || (currentPlan as any).price || abonnement.montant_mensuel || 0;
        }

        // Fallback sur le montant de l'abonnement si le plan n'est pas trouvé
        return abonnement.montant_mensuel || 0;
    };

    // Vérifier si l'abonnement est actif
    const isAbonnementActive = (): boolean => {
        if (!abonnement) {
            return false;
        }
        return (
            abonnement.statut === 'actif' &&
            abonnement.statut_paiement === 'valide' &&
            abonnement.est_actif === true
        );
    };

    const handlePlanClick = (plan: any) => {
        const planId = plan.slug || plan.id || 'unknown';
        const planName = plan.name || 'Unknown';
        const planPrice = plan.montant_mensuel || plan.price || 0;

        // Si c'est le plan actuel, ne rien faire
        if (abonnement?.plan === planId) {
            return;
        }

        // Si l'abonnement est actif, afficher le dialog d'avertissement
        if (isAbonnementActive()) {
            setPendingPlan({
                id: planId,
                name: planName,
                price: planPrice,
            });
            setIsWarningDialogOpen(true);
            return;
        }

        // Sinon, procéder directement au changement
        proceedWithPlanChange(planId, planName, planPrice);
    };

    const proceedWithPlanChange = (planId: string, planName: string, planPrice: number) => {
        setPlanToUpdate({
            id: planId,
            name: planName,
            price: planPrice,
        });
        setData({
            plan: planId,
            mode_paiement: '',
        });
        setIsPaymentDialogOpen(true);
    };

    const handleConfirmPlanChange = () => {
        if (pendingPlan) {
            proceedWithPlanChange(pendingPlan.id, pendingPlan.name, pendingPlan.price);
            setIsWarningDialogOpen(false);
            setPendingPlan(null);
        }
    };

    const handleSubmitPaymentMethod = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.mode_paiement) {
            return;
        }

        post(subscriptionRoutes.updatePlan.post().url, {
            onSuccess: () => {
                setIsPaymentDialogOpen(false);
                setPlanToUpdate(null);
            },
        });
    };

    const paymentMethods = [
        {
            value: 'espece',
            label: 'Espèces',
            icon: Wallet,
            description: 'Paiement en espèces',
        },
        {
            value: 'carte_bancaire',
            label: 'Carte bancaire',
            icon: CreditCard,
            description: 'Paiement par carte bancaire',
        },
        {
            value: 'mobile_money',
            label: 'Mobile Money',
            icon: Smartphone,
            description: 'Paiement via Mobile Money',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion de l'abonnement" />

            <div className="space-y-6 p-4">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion de l'abonnement</h1>
                        <p className="text-muted-foreground">
                            Gérez votre abonnement et consultez vos factures
                        </p>
                    </div>
                </div>

                {/* Abonnement actuel */}
                {abonnement ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Abonnement actuel</CardTitle>
                                    <CardDescription>
                                        Plan {getPlanName(abonnement.plan)}
                                    </CardDescription>
                                </div>
                                {getStatusBadge(abonnement.statut, abonnement.statut_paiement)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Montant mensuel</p>
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(getCurrentPlanAmount())}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                        {getPaymentMethodIcon(abonnement.mode_paiement)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mode de paiement</p>
                                        <p className="text-lg font-semibold">
                                            {getPaymentMethodLabel(abonnement.mode_paiement)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date d'expiration</p>
                                        <p className="text-lg font-semibold">
                                            {formatDate(abonnement.date_fin)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions de paiement */}
                            <div className="pt-4 border-t">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {abonnement.statut_paiement === 'en_attente' ? (
                                        <Button asChild className="flex-1">
                                            <Link href={paymentRoutes.show().url} className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Effectuer le paiement
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link href={paymentRoutes.show().url} className="flex items-center gap-2">
                                                <ArrowLeftRight className="h-4 w-4" />
                                                Changer le mode de paiement
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucun abonnement actif</CardTitle>
                            <CardDescription>
                                Vous n'avez pas d'abonnement actif. Veuillez souscrire à un plan.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Statistiques d'utilisation */}
                {abonnement && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques d'utilisation</CardTitle>
                            <CardDescription>
                                Utilisation actuelle de votre plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Utilisateurs */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Utilisateurs (admin, gérant, caisse, stock)</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {usage.users.current} / {usage.users.limit ?? 'Illimité'}
                                    </span>
                                </div>
                                {usage.users.limit && (
                                    <Progress value={usage.users.percentage} className="h-2" />
                                )}
                            </div>

                            {/* Serveurs */}
                            {usage.serveurs && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Serveur(e)s</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {usage.serveurs.current} / {usage.serveurs.limit ?? 'Illimité'}
                                        </span>
                                    </div>
                                    {usage.serveurs.limit && (
                                        <Progress value={usage.serveurs.percentage} className="h-2" />
                                    )}
                                </div>
                            )}

                            {/* Produits */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Produits</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {usage.products.current} / {usage.products.limit ?? 'Illimité'}
                                    </span>
                                </div>
                                {usage.products.limit && (
                                    <Progress value={usage.products.percentage} className="h-2" />
                                )}
                            </div>

                            {/* Ventes mensuelles */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Ventes mensuelles</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {usage.sales.current} / {usage.sales.limit ?? 'Illimité'}
                                    </span>
                                </div>
                                {usage.sales.limit && (
                                    <Progress value={usage.sales.percentage} className="h-2" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Plans disponibles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plans disponibles</CardTitle>
                        <CardDescription>
                            Choisissez le plan qui correspond à vos besoins
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Array.isArray(plans) ? plans : Object.values(plans)).map((plan: any) => {
                                // Convertir le plan en format attendu
                                const planId = plan.slug || plan.id || 'unknown';
                                const planName = plan.name || 'Unknown';
                                const planPrice = plan.montant_mensuel || plan.price || 0;
                                const planLimitations = plan.limitations || {};

                                // Générer les features à partir des limitations
                                const features: string[] = [];
                                if (planLimitations.rapports) {
                                    features.push('Rapports détaillés');
                                }
                                if (planLimitations.impression) {
                                    features.push('Impression de factures');
                                }
                                if (planLimitations.personnalisation) {
                                    features.push('Personnalisation');
                                }
                                if (planLimitations.support === 'prioritaire') {
                                    features.push('Support prioritaire');
                                } else if (planLimitations.support === 'email_phone') {
                                    features.push('Support email et téléphone');
                                } else if (planLimitations.support === 'email') {
                                    features.push('Support email');
                                }

                                return (
                                    <Card
                                        key={planId}
                                        className={`cursor-pointer transition-all ${selectedPlan === planId
                                            ? 'ring-2 ring-primary'
                                            : 'hover:shadow-md'
                                            } ${abonnement?.plan === planId
                                                ? 'border-primary'
                                                : ''
                                            }`}
                                        onClick={() => handlePlanClick(plan)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl">{planName}</CardTitle>
                                                {abonnement?.plan === planId && (
                                                    <Badge variant="outline">Actuel</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="text-2xl font-bold">
                                                {formatCurrency(planPrice)}/mois
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {plan.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            )}
                                            {features.length > 0 && (
                                                <ul className="space-y-2">
                                                    {features.map((feature, index) => (
                                                        <li key={index} className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div className="pt-4 border-t space-y-2">
                                                {planLimitations.max_users && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Limite: {planLimitations.max_users} utilisateurs (admin, gérant, caisse, stock)
                                                    </p>
                                                )}
                                                {planLimitations.max_serveurs && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Limite: {planLimitations.max_serveurs} serveur(e)s
                                                    </p>
                                                )}
                                                {planLimitations.max_produits && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Limite: {planLimitations.max_produits} produits
                                                    </p>
                                                )}
                                                {planLimitations.max_ventes_mois && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Limite: {planLimitations.max_ventes_mois} ventes/mois
                                                    </p>
                                                )}
                                                {!planLimitations.max_users && !planLimitations.max_produits && !planLimitations.max_ventes_mois && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Limites illimitées
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Factures */}
                <Card>
                    <CardHeader>
                        <CardTitle>Factures</CardTitle>
                        <CardDescription>
                            Historique de vos factures
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length > 0 ? (
                            <div className="space-y-4">
                                {invoices.data.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Receipt className="h-8 w-8 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{invoice.numero}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(invoice.date_emission)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">
                                                {formatCurrency(invoice.montant)}
                                            </span>
                                            <Badge
                                                variant={
                                                    invoice.statut === 'payee'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {invoice.statut}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Aucune facture disponible
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            Historique de vos transactions de paiement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                {getPaymentMethodIcon(transaction.provider)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.transaction_id}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">
                                                {formatCurrency(transaction.montant)}
                                            </span>
                                            <Badge
                                                variant={
                                                    transaction.status === 'completed'
                                                        ? 'default'
                                                        : transaction.status === 'pending'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                            >
                                                {transaction.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Aucune transaction disponible
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog d'avertissement pour changement de plan avec abonnement actif */}
                <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-orange-500" />
                                Avertissement : Abonnement actif
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Vous avez actuellement un abonnement actif. Changer de plan maintenant pourrait annuler votre abonnement actif et affecter l'accès à vos fonctionnalités.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                        Plan actuel : <strong>{getPlanName(abonnement?.plan || '')}</strong>
                                    </p>
                                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                        Nouveau plan : <strong>{pendingPlan?.name}</strong>
                                    </p>
                                    {abonnement?.date_fin && (
                                        <p className="text-xs text-orange-700 dark:text-orange-300">
                                            Votre abonnement actuel est valide jusqu'au {formatDate(abonnement.date_fin)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Conséquences possibles :</p>
                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Votre abonnement actuel sera annulé</li>
                                    <li>Vous devrez compléter le paiement pour le nouveau plan</li>
                                    <li>L'accès aux fonctionnalités peut être temporairement interrompu</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsWarningDialogOpen(false);
                                    setPendingPlan(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleConfirmPlanChange}
                            >
                                Je comprends, continuer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de sélection du mode de paiement */}
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Choisir le mode de paiement</DialogTitle>
                            <DialogDescription>
                                Sélectionnez votre mode de paiement pour le plan{' '}
                                <strong>{planToUpdate?.name}</strong> ({formatCurrency(planToUpdate?.price || 0)}/mois)
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitPaymentMethod}>
                            <div className="space-y-3 py-4">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <label
                                            key={method.value}
                                            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${data.mode_paiement === method.value
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                                : 'hover:bg-accent'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="mode_paiement"
                                                value={method.value}
                                                checked={data.mode_paiement === method.value}
                                                onChange={(e) => setData('mode_paiement', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${data.mode_paiement === method.value
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{method.label}</p>
                                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                            </div>
                                            {data.mode_paiement === method.value && (
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            )}
                                        </label>
                                    );
                                })}
                                {errors.mode_paiement && (
                                    <p className="text-sm text-destructive">{errors.mode_paiement}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsPaymentDialogOpen(false);
                                        setPlanToUpdate(null);
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing || !data.mode_paiement}>
                                    {processing ? 'Traitement...' : 'Confirmer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

