import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Plus, Trash2, Eye, Building2, RotateCcw, Archive } from 'lucide-react';

interface Restaurant {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
    est_actif: boolean;
    date_creation: string;
    deleted_at?: string;
    abonnement?: {
        plan: string;
        statut: string;
        montant_mensuel: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    restaurants: {
        data: Restaurant[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
    showDeleted?: boolean;
}

export default function RestaurantIndex({ restaurants, showDeleted = false }: Props) {
    const handleDelete = (restaurantId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
            router.delete(`/restaurant/${restaurantId}`);
        }
    };

    const handleRestore = (restaurantId: number) => {
        if (confirm('Êtes-vous sûr de vouloir restaurer ce restaurant ?')) {
            router.post(`/restaurant/${restaurantId}/restore`);
        }
    };

    const handleForceDelete = (restaurantId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce restaurant ? Cette action est irréversible.')) {
            router.delete(`/restaurant/${restaurantId}/force-delete`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const toggleDeletedView = () => {
        router.get('/restaurant', { deleted: !showDeleted }, { preserveState: true });
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Restaurants</h1>
                        <p className="text-muted-foreground">Gérez les restaurants et leurs abonnements</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleDeletedView}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                                showDeleted
                                    ? 'bg-muted text-foreground hover:bg-muted/80'
                                    : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <Archive className="h-4 w-4" />
                            {showDeleted ? 'Voir les restaurants actifs' : 'Voir les restaurants supprimés'}
                        </button>
                        {!showDeleted && (
                            <Link
                                href="/restaurant/create"
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Nouveau Restaurant
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Restaurant</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Téléphone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            <Building2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>{showDeleted ? 'Aucun restaurant supprimé' : 'Aucun restaurant trouvé'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    restaurants.data.map((restaurant: Restaurant) => (
                                        <tr key={restaurant.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{restaurant.nom}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Créé le {new Date(restaurant.date_creation).toLocaleDateString('fr-FR')}
                                                </div>
                                                {showDeleted && restaurant.deleted_at && (
                                                    <div className="text-sm text-red-500">
                                                        Supprimé le {new Date(restaurant.deleted_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{restaurant.email}</td>
                                            <td className="px-4 py-3">{restaurant.telephone || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                                    {restaurant.abonnement?.plan || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-block w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                                                            restaurant.est_actif
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-red-500/10 text-red-500'
                                                        }`}
                                                    >
                                                        {restaurant.est_actif ? 'Actif' : 'Suspendu'}
                                                    </span>
                                                    {restaurant.abonnement && (
                                                        <span
                                                            className={`inline-block w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                                                                restaurant.abonnement.statut === 'actif'
                                                                    ? 'bg-blue-500/10 text-blue-500'
                                                                    : 'bg-yellow-500/10 text-yellow-500'
                                                            }`}
                                                        >
                                                            Abo: {restaurant.abonnement.statut}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {!showDeleted ? (
                                                        <>
                                                            <Link
                                                                href={`/restaurant/${restaurant.id}`}
                                                                className="rounded-lg p-2 hover:bg-muted"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(restaurant.id)}
                                                                className="rounded-lg p-2 text-destructive hover:bg-muted"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleRestore(restaurant.id)}
                                                                className="rounded-lg p-2 text-green-600 hover:bg-muted"
                                                                title="Restaurer"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleForceDelete(restaurant.id)}
                                                                className="rounded-lg p-2 text-destructive hover:bg-muted"
                                                                title="Supprimer définitivement"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {restaurants.links && restaurants.links.length > 3 && (
                        <div className="border-t border-border p-4">
                            <div className="flex justify-center gap-2">
                                {restaurants.links.map((link: PaginationLink, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-lg px-3 py-1 ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

