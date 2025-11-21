import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Table components - using standard HTML table for now
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed import of Textarea due to missing module or type declarations error.
import {
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Building2,
    User,
    Mail,
    Phone,
    CreditCard,
    Wallet,
    AlertCircle,
    Eye,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Restaurant {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
    users?: User[];
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Abonnement {
    id: number;
    restaurant_id: number;
    plan: string;
    montant_mensuel: number;
    mode_paiement: string;
    statut_paiement: string;
    statut: string;
    est_actif: boolean;
    date_debut: string;
    date_fin: string;
    created_at: string;
    restaurant: Restaurant;
}

interface Props {
    pendingSubscriptions: Abonnement[];
    allSubscriptions: {
        data: Abonnement[];
        links: unknown[];
        meta: unknown;
    };
}

const getStatusBadge = (statut: string, statutPaiement: string) => {
    if (statutPaiement === 'valide') {
        return (
            <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Validé
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
        case 'carte_bancaire':
            return <CreditCard className="h-4 w-4" />;
        case 'espece':
            return <Wallet className="h-4 w-4" />;
        default:
            return <DollarSign className="h-4 w-4" />;
    }
};

const getPaymentMethodLabel = (mode: string) => {
    switch (mode) {
        case 'carte_bancaire':
            return 'Carte Bancaire';
        case 'espece':
            return 'Espèce';
        default:
            return mode;
    }
};

const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
        simple: 'Starter',
        medium: 'Business',
        premium: 'Pro',
    };
    return plans[plan] || plan;
};

export default function SubscriptionsIndex({ pendingSubscriptions, allSubscriptions }: Props) {
    const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showChangeMethodDialog, setShowChangeMethodDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState('');

    const handleValidate = (abonnement: Abonnement) => {
        setSelectedAbonnement(abonnement);
        setShowValidateDialog(true);
    };

    const handleReject = (abonnement: Abonnement) => {
        setSelectedAbonnement(abonnement);
        setShowRejectDialog(true);
    };

    const handleChangePaymentMethod = (abonnement: Abonnement) => {
        setSelectedAbonnement(abonnement);
        setNewPaymentMethod(abonnement.mode_paiement);
        setShowChangeMethodDialog(true);
    };

    const confirmValidate = () => {
        if (selectedAbonnement) {
            router.post(`/admin/subscriptions/${selectedAbonnement.id}/validate`, {}, {
                onSuccess: () => {
                    setShowValidateDialog(false);
                    setSelectedAbonnement(null);
                },
            });
        }
    };

    const confirmReject = () => {
        if (selectedAbonnement) {
            router.post(`/admin/subscriptions/${selectedAbonnement.id}/reject`, {
                reason: rejectReason,
            }, {
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setSelectedAbonnement(null);
                    setRejectReason('');
                },
            });
        }
    };

    const confirmChangeMethod = () => {
        if (selectedAbonnement && newPaymentMethod) {
            router.post(`/admin/subscriptions/${selectedAbonnement.id}/change-payment-method`, {
                mode_paiement: newPaymentMethod,
            }, {
                onSuccess: () => {
                    setShowChangeMethodDialog(false);
                    setSelectedAbonnement(null);
                    setNewPaymentMethod('');
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Gestion des Abonnements" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez les abonnements et validez les paiements en espèce
                        </p>
                    </div>
                </div>

                {/* Alertes pour les paiements en attente */}
                {pendingSubscriptions.length > 0 && (
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
                            {pendingSubscriptions.length} paiement(s) en attente de validation
                        </AlertTitle>
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                            Des restaurants ont sélectionné le paiement en espèce et attendent votre validation.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Liste des abonnements en attente */}
                {pendingSubscriptions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Paiements en attente de validation</CardTitle>
                            <CardDescription>
                                {pendingSubscriptions.length} abonnement(s) nécessitant une validation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Restaurant</th>
                                            <th className="text-left p-2">Plan</th>
                                            <th className="text-left p-2">Montant</th>
                                            <th className="text-left p-2">Mode de paiement</th>
                                            <th className="text-left p-2">Date</th>
                                            <th className="text-left p-2">Statut</th>
                                            <th className="text-right p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingSubscriptions.map((abonnement) => (
                                            <tr key={abonnement.id} className="border-b">
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">{abonnement.restaurant?.nom || 'Restaurant inconnu'}</div>
                                                            {abonnement.restaurant?.email && (
                                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {abonnement.restaurant.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <Badge variant="outline">{getPlanName(abonnement.plan)}</Badge>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        {typeof abonnement.montant_mensuel === 'number'
                                                            ? abonnement.montant_mensuel.toFixed(2)
                                                            : parseFloat(abonnement.montant_mensuel).toFixed(2)} USD
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        {getPaymentMethodIcon(abonnement.mode_paiement)}
                                                        {getPaymentMethodLabel(abonnement.mode_paiement)}
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    {new Date(abonnement.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="p-2">
                                                    {getStatusBadge(abonnement.statut, abonnement.statut_paiement)}
                                                </td>
                                                <td className="p-2 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleChangePaymentMethod(abonnement)}
                                                        >
                                                            Changer mode
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/admin/subscriptions/${abonnement.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleReject(abonnement)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Refuser
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleValidate(abonnement)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Valider
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tous les abonnements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tous les abonnements</CardTitle>
                        <CardDescription>
                            Liste complète de tous les abonnements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Restaurant</th>
                                        <th className="text-left p-2">Plan</th>
                                        <th className="text-left p-2">Montant</th>
                                        <th className="text-left p-2">Mode de paiement</th>
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Statut</th>
                                        <th className="text-right p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allSubscriptions.data.map((abonnement) => (
                                        <tr key={abonnement.id} className="border-b">
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{abonnement.restaurant?.nom || 'Restaurant inconnu'}</div>
                                                        {abonnement.restaurant?.email && (
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {abonnement.restaurant.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <Badge variant="outline">{getPlanName(abonnement.plan)}</Badge>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {typeof abonnement.montant_mensuel === 'number'
                                                        ? abonnement.montant_mensuel.toFixed(2)
                                                        : parseFloat(abonnement.montant_mensuel).toFixed(2)} USD
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    {getPaymentMethodIcon(abonnement.mode_paiement)}
                                                    {getPaymentMethodLabel(abonnement.mode_paiement)}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                {new Date(abonnement.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="p-2">
                                                {getStatusBadge(abonnement.statut, abonnement.statut_paiement)}
                                            </td>
                                            <td className="p-2 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/admin/subscriptions/${abonnement.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Dialog de validation */}
                <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Valider le paiement</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir valider ce paiement ? Le compte sera activé.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedAbonnement && (
                            <div className="space-y-2">
                                <div>
                                    <strong>Restaurant:</strong> {selectedAbonnement.restaurant?.nom || 'Restaurant inconnu'}
                                </div>
                                <div>
                                    <strong>Montant:</strong> ${typeof selectedAbonnement.montant_mensuel === 'number'
                                        ? selectedAbonnement.montant_mensuel.toFixed(2)
                                        : parseFloat(selectedAbonnement.montant_mensuel).toFixed(2)} USD
                                </div>
                                <div>
                                    <strong>Plan:</strong> {getPlanName(selectedAbonnement.plan)}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowValidateDialog(false)}>
                                Annuler
                            </Button>
                            <Button onClick={confirmValidate}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Valider
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de refus */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Refuser le paiement</DialogTitle>
                            <DialogDescription>
                                Indiquez la raison du refus (optionnel)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="reject_reason">Raison du refus</Label>
                                <textarea
                                    id="reject_reason"
                                    value={rejectReason}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                                    placeholder="Raison du refus (optionnel)"
                                    rows={3}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={confirmReject}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de changement de mode de paiement */}
                <Dialog open={showChangeMethodDialog} onOpenChange={setShowChangeMethodDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Changer le mode de paiement</DialogTitle>
                            <DialogDescription>
                                Sélectionnez un nouveau mode de paiement pour cet abonnement
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="payment_method">Mode de paiement</Label>
                                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un mode de paiement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="carte_bancaire">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Carte Bancaire
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="espece">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="h-4 w-4" />
                                                Espèce
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowChangeMethodDialog(false)}>
                                Annuler
                            </Button>
                            <Button onClick={confirmChangeMethod} disabled={!newPaymentMethod}>
                                Changer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

