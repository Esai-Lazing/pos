import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
// Textarea component - using standard textarea for now
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    DollarSign,
    Calendar,
    CreditCard,
    Wallet,
    CheckCircle2,
    XCircle,
    Clock,
    User,
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
    role: string;
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
    abonnement: Abonnement;
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

export default function SubscriptionShow({ abonnement }: Props) {
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showChangeMethodDialog, setShowChangeMethodDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState(abonnement.mode_paiement);

    const confirmValidate = () => {
        router.post(`/admin/subscriptions/${abonnement.id}/validate`, {}, {
            onSuccess: () => {
                setShowValidateDialog(false);
            },
        });
    };

    const confirmReject = () => {
        router.post(`/admin/subscriptions/${abonnement.id}/reject`, {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setShowRejectDialog(false);
                setRejectReason('');
            },
        });
    };

    const confirmChangeMethod = () => {
        router.post(`/admin/subscriptions/${abonnement.id}/change-payment-method`, {
            mode_paiement: newPaymentMethod,
        }, {
            onSuccess: () => {
                setShowChangeMethodDialog(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Abonnement - ${abonnement.restaurant.nom}`} />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/subscriptions">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Détails de l'abonnement</h1>
                            <p className="text-muted-foreground mt-1">
                                {abonnement.restaurant.nom}
                            </p>
                        </div>
                    </div>
                    {abonnement.statut_paiement === 'en_attente' && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowChangeMethodDialog(true)}
                            >
                                Changer le mode de paiement
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectDialog(true)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser
                            </Button>
                            <Button onClick={() => setShowValidateDialog(true)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Valider
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Informations du restaurant */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du restaurant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-semibold">{abonnement.restaurant.nom}</div>
                                </div>
                            </div>
                            {abonnement.restaurant.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div className="text-sm">{abonnement.restaurant.email}</div>
                                </div>
                            )}
                            {abonnement.restaurant.telephone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div className="text-sm">{abonnement.restaurant.telephone}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Informations de l'abonnement */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de l'abonnement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Plan</div>
                                <div className="font-semibold">{getPlanName(abonnement.plan)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Montant mensuel</div>
                                <div className="font-semibold flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    {typeof abonnement.montant_mensuel === 'number'
                                        ? abonnement.montant_mensuel.toFixed(2)
                                        : parseFloat(abonnement.montant_mensuel).toFixed(2)} USD
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Mode de paiement</div>
                                <div className="font-semibold flex items-center gap-2">
                                    {abonnement.mode_paiement === 'carte_bancaire' ? (
                                        <CreditCard className="h-4 w-4" />
                                    ) : (
                                        <Wallet className="h-4 w-4" />
                                    )}
                                    {getPaymentMethodLabel(abonnement.mode_paiement)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Statut</div>
                                <div>
                                    {getStatusBadge(abonnement.statut, abonnement.statut_paiement)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Date de début</div>
                                <div className="font-semibold flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                            {abonnement.date_fin && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Date de fin</div>
                                    <div className="font-semibold flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Utilisateurs du restaurant */}
                {abonnement.restaurant.users && abonnement.restaurant.users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {abonnement.restaurant.users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg border">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                        <Badge variant="outline">{user.role}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dialogs */}
                <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Valider le paiement</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir valider ce paiement ? Le compte sera activé.
                            </DialogDescription>
                        </DialogHeader>
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
                                <Textarea
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

