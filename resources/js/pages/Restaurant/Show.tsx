import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Trash2, Building2, Mail, Phone, Calendar, DollarSign, CheckCircle, XCircle, Edit, Pause, Play, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type SharedData } from '@/types';

interface Abonnement {
    id: number;
    plan: string;
    montant_mensuel: string;
    date_debut: string;
    date_fin?: string;
    statut: string;
    est_actif: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Restaurant {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
    est_actif: boolean;
    date_creation: string;
    created_at: string;
    abonnement?: Abonnement;
    customization?: {
        adresse?: string;
        ville?: string;
        pays?: string;
    };
    users?: User[];
}

interface Props {
    restaurant: Restaurant;
}

export default function RestaurantShow({ restaurant }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [isSuspending, setIsSuspending] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [isSuspendingRestaurant, setIsSuspendingRestaurant] = useState(false);
    const [isActivatingRestaurant, setIsActivatingRestaurant] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Afficher le modal des identifiants si présents dans les flash messages
    useEffect(() => {
        if (flash?.admin_credentials) {
            setShowCredentialsModal(true);
        }
    }, [flash?.admin_credentials]);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCloseCredentialsModal = () => {
        setShowCredentialsModal(false);
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.')) {
            router.delete(`/restaurant/${restaurant.id}`);
        }
    };

    const handleSuspendRestaurant = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Êtes-vous sûr de vouloir suspendre ce restaurant ? Tous les utilisateurs et l\'abonnement seront également suspendus.')) {
            setIsSuspendingRestaurant(true);
            router.post(
                `/restaurant/${restaurant.id}/suspend`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSuspendingRestaurant(false);
                        router.reload({ only: ['restaurant'] });
                    },
                    onError: () => {
                        setIsSuspendingRestaurant(false);
                    },
                    onFinish: () => {
                        setIsSuspendingRestaurant(false);
                    },
                }
            );
        }
    };

    const handleActivateRestaurant = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Êtes-vous sûr de vouloir activer ce restaurant ?')) {
            setIsActivatingRestaurant(true);
            router.post(
                `/restaurant/${restaurant.id}/activate`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsActivatingRestaurant(false);
                        router.reload({ only: ['restaurant'] });
                    },
                    onError: () => {
                        setIsActivatingRestaurant(false);
                    },
                    onFinish: () => {
                        setIsActivatingRestaurant(false);
                    },
                }
            );
        }
    };

    const handleSuspend = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Êtes-vous sûr de vouloir suspendre cet abonnement ?')) {
            setIsSuspending(true);
            router.post(
                `/restaurant/${restaurant.id}/abonnement/suspend`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSuspending(false);
                        router.reload({ only: ['restaurant'] });
                    },
                    onError: () => {
                        setIsSuspending(false);
                    },
                    onFinish: () => {
                        setIsSuspending(false);
                    },
                }
            );
        }
    };

    const handleActivate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Êtes-vous sûr de vouloir activer cet abonnement ?')) {
            setIsActivating(true);
            router.post(
                `/restaurant/${restaurant.id}/abonnement/activate`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsActivating(false);
                        router.reload({ only: ['restaurant'] });
                    },
                    onError: () => {
                        setIsActivating(false);
                    },
                    onFinish: () => {
                        setIsActivating(false);
                    },
                }
            );
        }
    };

    return (
        <AppLayout>
            {/* Modal des identifiants admin */}
            {flash?.admin_credentials && (
                <Dialog open={showCredentialsModal} onOpenChange={(open) => {
                    if (!open) {
                        setShowCredentialsModal(false);
                        // Supprimer les identifiants des flash messages après fermeture
                        router.reload({ only: [] });
                    }
                }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Identifiants de connexion créés</DialogTitle>
                            <DialogDescription>
                                Les identifiants de connexion pour l'administrateur du restaurant ont été créés avec succès.
                                Veuillez noter ces informations et les transmettre au propriétaire du restaurant.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                                <div className="mb-2 text-sm font-medium text-muted-foreground">Nom</div>
                                <div className="text-lg font-semibold">{flash.admin_credentials.name}</div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(flash.admin_credentials!.email, 'email')}
                                        className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted"
                                    >
                                        {copiedField === 'email' ? (
                                            <>
                                                <Check className="h-3 w-3 text-green-500" />
                                                Copié
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                Copier
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="font-mono text-lg font-semibold">{flash.admin_credentials.email}</div>
                            </div>

                            <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                        Mot de passe temporaire
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(flash.admin_credentials!.password, 'password')}
                                        className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                                    >
                                        {copiedField === 'password' ? (
                                            <>
                                                <Check className="h-3 w-3 text-green-500" />
                                                Copié
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                Copier
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="font-mono text-lg font-bold text-yellow-900 dark:text-yellow-100">
                                    {flash.admin_credentials.password}
                                </div>
                                <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                                    ⚠️ Important : Ce mot de passe ne sera affiché qu'une seule fois. 
                                    Assurez-vous de le noter et de le transmettre au propriétaire du restaurant.
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    📋 Instructions
                                </div>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-blue-800 dark:text-blue-200">
                                    <li>Le propriétaire devra se connecter avec cet email et ce mot de passe</li>
                                    <li>Il est recommandé de changer le mot de passe après la première connexion</li>
                                    <li>Ces identifiants permettent d'accéder à toutes les fonctionnalités du restaurant</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCredentialsModal(false);
                                    // Supprimer les identifiants des flash messages après fermeture
                                    router.reload({ only: [] });
                                }}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                                J'ai noté les identifiants
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/restaurant"
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{restaurant.nom}</h1>
                        <p className="text-muted-foreground">Détails du restaurant et de son abonnement</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 rounded-lg border border-destructive bg-background px-4 py-2 text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Informations du restaurant */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <Building2 className="h-5 w-5" />
                            Informations du restaurant
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                                <p className="text-lg font-semibold">{restaurant.nom}</p>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </label>
                                <p className="text-lg">{restaurant.email}</p>
                            </div>
                            {restaurant.telephone && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        Téléphone
                                    </label>
                                    <p className="text-lg">{restaurant.telephone}</p>
                                </div>
                            )}
                            {restaurant.customization?.adresse && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                                    <p className="text-lg">
                                        {restaurant.customization.adresse}
                                        {restaurant.customization.ville && `, ${restaurant.customization.ville}`}
                                        {restaurant.customization.pays && `, ${restaurant.customization.pays}`}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Date de création
                                </label>
                                <p className="text-lg">
                                    {new Date(restaurant.date_creation).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Statut</label>
                                <div className="mt-1 flex items-center gap-2">
                                    {restaurant.est_actif ? (
                                        <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-500">
                                            <CheckCircle className="h-4 w-4" />
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-500">
                                            <XCircle className="h-4 w-4" />
                                            Suspendu
                                        </span>
                                    )}
                                    {restaurant.est_actif ? (
                                        <button
                                            type="button"
                                            onClick={handleSuspendRestaurant}
                                            disabled={isSuspendingRestaurant}
                                            className="flex items-center gap-1 rounded-lg border border-red-500 bg-background px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Pause className="h-3 w-3" />
                                            {isSuspendingRestaurant ? 'Suspension...' : 'Suspendre'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleActivateRestaurant}
                                            disabled={isActivatingRestaurant}
                                            className="flex items-center gap-1 rounded-lg border border-green-500 bg-background px-2 py-1 text-xs text-green-500 hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Play className="h-3 w-3" />
                                            {isActivatingRestaurant ? 'Activation...' : 'Activer'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Abonnement */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <DollarSign className="h-5 w-5" />
                                Abonnement
                            </h2>
                            {restaurant.abonnement && (
                                <Link
                                    href={`/restaurant/${restaurant.id}/abonnement/edit`}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
                                >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                </Link>
                            )}
                        </div>
                        {restaurant.abonnement ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Plan</label>
                                    <p className="text-lg font-semibold capitalize">{restaurant.abonnement.plan}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Montant mensuel</label>
                                    <p className="text-lg font-semibold">
                                        {parseFloat(restaurant.abonnement.montant_mensuel).toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date de début</label>
                                    <p className="text-lg">
                                        {new Date(restaurant.abonnement.date_debut).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                {restaurant.abonnement.date_fin && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date de fin</label>
                                        <p className="text-lg">
                                            {new Date(restaurant.abonnement.date_fin).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                restaurant.abonnement.statut === 'actif'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : restaurant.abonnement.statut === 'suspendu'
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'bg-red-500/10 text-red-500'
                                            }`}
                                        >
                                            {restaurant.abonnement.statut === 'actif'
                                                ? 'Actif'
                                                : restaurant.abonnement.statut === 'suspendu'
                                                ? 'Suspendu'
                                                : 'Expiré'}
                                        </span>
                                        {restaurant.abonnement.statut === 'actif' ? (
                                            <button
                                                type="button"
                                                onClick={handleSuspend}
                                                disabled={isSuspending}
                                                className="flex items-center gap-1 rounded-lg border border-yellow-500 bg-background px-2 py-1 text-xs text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Pause className="h-3 w-3" />
                                                {isSuspending ? 'Suspension...' : 'Suspendre'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleActivate}
                                                disabled={isActivating}
                                                className="flex items-center gap-1 rounded-lg border border-green-500 bg-background px-2 py-1 text-xs text-green-500 hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Play className="h-3 w-3" />
                                                {isActivating ? 'Activation...' : 'Activer'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-muted-foreground">Aucun abonnement actif</p>
                                <Link
                                    href={`/restaurant/${restaurant.id}/abonnement/edit`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                                >
                                    <Edit className="h-4 w-4" />
                                    Créer un abonnement
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Utilisateurs */}
                {restaurant.users && restaurant.users.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-xl font-semibold">Utilisateurs associés</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Rôle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurant.users.map((user) => (
                                        <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 font-semibold">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary capitalize">
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

