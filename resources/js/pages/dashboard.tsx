import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import * as restaurantRoutes from '@/routes/restaurant';
import * as venteRoutes from '@/routes/vente';
import * as stockRoutes from '@/routes/stock';
import * as rapportRoutes from '@/routes/rapports';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    History,
    BarChart3,
    ArrowRight,
    Receipt,
    Building2,
    Users,
    Plus,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Statistiques {
    restaurants?: {
        total: number;
        actifs: number;
        inactifs: number;
        supprimes: number;
    };
    ventes_aujourdhui?: {
        total_fc: number;
        total_usd: number;
        nombre: number;
    };
    ventes_semaine?: {
        total_fc: number;
        total_usd: number;
    };
    ventes_mois?: {
        total_fc: number;
        total_usd: number;
    };
    stock?: {
        total_produits: number;
        produits_stock_bas: number;
    };
    utilisateurs?: {
        total: number;
        actifs: number;
    };
}

interface ProduitVendu {
    produit: string;
    quantite: number;
    total_fc: number;
}

interface Vente {
    id: number;
    numero_facture: string;
    montant_total_fc: number;
    montant_total_usd: number;
    created_at: string;
    user?: {
        name: string;
    };
    items?: Array<{
        produit?: {
            nom: string;
        };
    }>;
}

interface ProduitStockBas {
    id: number;
    nom: string;
    code: string | null;
    stock_total_bouteilles: number;
    stock_minimum: number;
    bouteilles_par_casier: number;
}

interface MouvementStock {
    id: number;
    type: string;
    quantite_totale_bouteilles: number;
    date_mouvement: string;
    produit?: {
        nom: string;
    };
    user?: {
        name: string;
    };
}

interface Restaurant {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
    est_actif: boolean;
    date_creation: string;
    abonnement?: {
        plan: string;
        statut: string;
    };
}

interface Abonnement {
    plan: string | null;
    date_fin: string | null;
    est_actif: boolean;
    limitations: {
        max_users?: number | null;
        max_produits?: number | null;
        max_ventes_mois?: number | null;
        rapports?: boolean;
        impression?: boolean;
        personnalisation?: boolean;
    };
    utilisation: {
        users: {
            actuel: number;
            max: number | null;
            pourcentage: number;
        };
        produits: {
            actuel: number;
            max: number | null;
            pourcentage: number;
        };
        ventes_mois: {
            actuel: number;
            max: number | null;
            pourcentage: number;
        };
    };
}

interface Props {
    role: 'admin' | 'caisse' | 'stock' | 'super-admin';
    is_super_admin?: boolean;
    statistiques?: Statistiques;
    produits_vendus?: ProduitVendu[];
    dernieres_ventes?: Vente[];
    produits_stock_bas?: ProduitStockBas[];
    mouvements_recents?: MouvementStock[];
    derniers_restaurants?: Restaurant[];
    abonnement?: Abonnement;
}

export default function Dashboard({
    role,
    is_super_admin = false,
    statistiques,
    produits_vendus,
    dernieres_ventes,
    produits_stock_bas,
    mouvements_recents,
    derniers_restaurants,
    abonnement,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    // Dashboard Super Admin
    if (is_super_admin || role === 'super-admin') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Super Admin" />
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Dashboard Super Administrateur</h1>
                        <div className="text-sm text-muted-foreground">
                            Bienvenue, {auth.user.name}
                        </div>
                    </div>

                    {/* Statistiques des restaurants */}
                    {statistiques?.restaurants && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total restaurants</div>
                                        <div className="text-2xl font-bold">{statistiques.restaurants.total}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Restaurants actifs</div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {statistiques.restaurants.actifs}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Restaurants inactifs</div>
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {statistiques.restaurants.inactifs}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Restaurants supprimés</div>
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {statistiques.restaurants.supprimes}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistiques globales */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {statistiques?.ventes_aujourdhui && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Ventes aujourd'hui</div>
                                        <div className="text-xl font-bold">
                                            {Number(statistiques.ventes_aujourdhui.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${Number(statistiques.ventes_aujourdhui.total_usd).toFixed(2)} USD
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {statistiques.ventes_aujourdhui.nombre} ventes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {statistiques?.utilisateurs && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Utilisateurs</div>
                                        <div className="text-xl font-bold">{statistiques.utilisateurs.total}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {statistiques.utilisateurs.actifs} actifs
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions rapides */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link
                            href={restaurantRoutes.create().url}
                            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-primary p-3">
                                    <Plus className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold">Nouveau restaurant</div>
                                    <div className="text-sm text-muted-foreground">Créer un nouveau restaurant</div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={restaurantRoutes.index().url}
                            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-muted p-3">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-semibold">Gérer les restaurants</div>
                                    <div className="text-sm text-muted-foreground">Voir tous les restaurants</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Derniers restaurants */}
                    {derniers_restaurants && derniers_restaurants.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Derniers restaurants créés</h2>
                                <Link
                                    href={restaurantRoutes.index().url}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Voir tout
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {derniers_restaurants.map((restaurant) => (
                                    <Link
                                        key={restaurant.id}
                                        href={restaurantRoutes.show(restaurant.id).url}
                                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent"
                                    >
                                        <div>
                                            <div className="font-medium">{restaurant.nom}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {restaurant.email}
                                                {restaurant.telephone && ` • ${restaurant.telephone}`}
                                            </div>
                                            {restaurant.abonnement && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Plan: {restaurant.abonnement.plan} • {restaurant.abonnement.statut}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-sm font-semibold ${
                                                    restaurant.est_actif
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-yellow-600 dark:text-yellow-400'
                                                }`}
                                            >
                                                {restaurant.est_actif ? 'Actif' : 'Inactif'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(restaurant.date_creation).toLocaleDateString('fr-CD')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Dashboard Admin
    if (role === 'admin') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Admin" />
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Dashboard Administrateur</h1>
                        <div className="text-sm text-muted-foreground">
                            Bienvenue, {auth.user.name}
                        </div>
                    </div>

                    {/* Statistiques du jour */}
                    {statistiques?.ventes_aujourdhui && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Ventes aujourd'hui (FC)</div>
                                        <div className="text-2xl font-bold">
                                            {Number(statistiques.ventes_aujourdhui.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Ventes aujourd'hui (USD)</div>
                                        <div className="text-2xl font-bold">
                                            ${Number(statistiques.ventes_aujourdhui.total_usd).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Nombre de ventes</div>
                                        <div className="text-2xl font-bold">{statistiques.ventes_aujourdhui.nombre}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistiques semaine et mois */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {statistiques?.ventes_semaine && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Ventes de la semaine</div>
                                        <div className="text-xl font-bold">
                                            {Number(statistiques.ventes_semaine.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${Number(statistiques.ventes_semaine.total_usd).toFixed(2)} USD
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {statistiques?.ventes_mois && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Ventes du mois</div>
                                        <div className="text-xl font-bold">
                                            {Number(statistiques.ventes_mois.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${Number(statistiques.ventes_mois.total_usd).toFixed(2)} USD
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Informations d'abonnement */}
                    {abonnement && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Plan d'abonnement</h2>
                                <div
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        abonnement.est_actif
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    }`}
                                >
                                    {abonnement.est_actif ? 'Actif' : 'Inactif'}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm text-muted-foreground">Plan actuel</div>
                                <div className="text-xl font-bold capitalize">
                                    {abonnement.plan || 'Aucun plan'}
                                </div>
                                {abonnement.date_fin && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Expire le : {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                            </div>

                            {/* Utilisation des limites */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">Utilisateurs</span>
                                        <span className="text-sm text-muted-foreground">
                                            {abonnement.utilisation.users.actuel}
                                            {abonnement.utilisation.users.max !== null
                                                ? ` / ${abonnement.utilisation.users.max}`
                                                : ' / Illimité'}
                                        </span>
                                    </div>
                                    {abonnement.utilisation.users.max !== null && (
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full transition-all ${
                                                    abonnement.utilisation.users.pourcentage >= 90
                                                        ? 'bg-red-500'
                                                        : abonnement.utilisation.users.pourcentage >= 70
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(abonnement.utilisation.users.pourcentage, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">Produits</span>
                                        <span className="text-sm text-muted-foreground">
                                            {abonnement.utilisation.produits.actuel}
                                            {abonnement.utilisation.produits.max !== null
                                                ? ` / ${abonnement.utilisation.produits.max}`
                                                : ' / Illimité'}
                                        </span>
                                    </div>
                                    {abonnement.utilisation.produits.max !== null && (
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full transition-all ${
                                                    abonnement.utilisation.produits.pourcentage >= 90
                                                        ? 'bg-red-500'
                                                        : abonnement.utilisation.produits.pourcentage >= 70
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(abonnement.utilisation.produits.pourcentage, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">Ventes ce mois</span>
                                        <span className="text-sm text-muted-foreground">
                                            {abonnement.utilisation.ventes_mois.actuel}
                                            {abonnement.utilisation.ventes_mois.max !== null
                                                ? ` / ${abonnement.utilisation.ventes_mois.max}`
                                                : ' / Illimité'}
                                        </span>
                                    </div>
                                    {abonnement.utilisation.ventes_mois.max !== null && (
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full transition-all ${
                                                    abonnement.utilisation.ventes_mois.pourcentage >= 90
                                                        ? 'bg-red-500'
                                                        : abonnement.utilisation.ventes_mois.pourcentage >= 70
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(abonnement.utilisation.ventes_mois.pourcentage, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fonctionnalités disponibles */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="text-sm font-medium mb-2">Fonctionnalités</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                abonnement.limitations.rapports
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        />
                                        <span className="text-muted-foreground">Rapports</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                abonnement.limitations.impression
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        />
                                        <span className="text-muted-foreground">Impression</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                abonnement.limitations.personnalisation
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        />
                                        <span className="text-muted-foreground">Personnalisation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stock */}
                    {statistiques?.stock && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total produits</div>
                                        <div className="text-2xl font-bold">{statistiques.stock.total_produits}</div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={stockRoutes.index().url}
                                className="rounded-lg border border-red-500 bg-red-50 p-4 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Produits en stock bas</div>
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {statistiques.stock.produits_stock_bas}
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Produits les plus vendus */}
                    {produits_vendus && produits_vendus.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-4 font-semibold">Produits les plus vendus aujourd'hui</h2>
                            <div className="space-y-2">
                                {produits_vendus.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{index + 1}.</span>
                                            <span>{item.produit}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.quantite} unités - {Number(item.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dernières ventes */}
                    {dernieres_ventes && dernieres_ventes.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Dernières ventes</h2>
                                <Link
                                    href={venteRoutes.index().url}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Voir tout
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {dernieres_ventes.map((vente) => (
                                    <Link
                                        key={vente.id}
                                        href={venteRoutes.show(vente.id).url}
                                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent"
                                    >
                                        <div>
                                            <div className="font-medium">{vente.numero_facture}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(vente.created_at).toLocaleString('fr-CD')}
                                                {vente.user && ` • Par ${vente.user.name}`}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">
                                                {Number(vente.montant_total_fc).toLocaleString('fr-CD')} FC
                                            </div>
                                            {Number(vente.montant_total_usd || 0) > 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    ${Number(vente.montant_total_usd).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Dashboard Caisse
    if (role === 'caisse') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Caisse" />
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Dashboard Caisse</h1>
                        <div className="text-sm text-muted-foreground">
                            Bienvenue, {auth.user.name}
                        </div>
                    </div>

                    {/* Statistiques du jour */}
                    {statistiques?.ventes_aujourdhui && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Mes ventes aujourd'hui (FC)</div>
                                        <div className="text-2xl font-bold">
                                            {Number(statistiques.ventes_aujourdhui.total_fc).toLocaleString('fr-CD')} FC
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Mes ventes aujourd'hui (USD)</div>
                                        <div className="text-2xl font-bold">
                                            ${Number(statistiques.ventes_aujourdhui.total_usd).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Nombre de ventes</div>
                                        <div className="text-2xl font-bold">{statistiques.ventes_aujourdhui.nombre}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions rapides */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link
                            href={venteRoutes.create().url}
                            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-primary p-3">
                                    <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold">Nouvelle vente</div>
                                    <div className="text-sm text-muted-foreground">Créer une nouvelle vente</div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={venteRoutes.index().url}
                            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-muted p-3">
                                    <History className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-semibold">Historique</div>
                                    <div className="text-sm text-muted-foreground">Voir mes ventes</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Dernières ventes */}
                    {dernieres_ventes && dernieres_ventes.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Mes dernières ventes</h2>
                                <Link
                                    href={venteRoutes.index().url}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Voir tout
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {dernieres_ventes.map((vente) => (
                                    <Link
                                        key={vente.id}
                                        href={venteRoutes.show(vente.id).url}
                                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{vente.numero_facture}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(vente.created_at).toLocaleString('fr-CD')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">
                                                {Number(vente.montant_total_fc).toLocaleString('fr-CD')} FC
                                            </div>
                                            {Number(vente.montant_total_usd || 0) > 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    ${Number(vente.montant_total_usd).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {(!dernieres_ventes || dernieres_ventes.length === 0) && (
                        <div className="rounded-lg border border-border bg-card p-8 text-center">
                            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">Aucune vente enregistrée aujourd'hui</p>
                            <Link
                                href={venteRoutes.create().url}
                                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                            >
                                Créer une vente
                            </Link>
                        </div>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Dashboard Stock
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Stock" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Stock</h1>
                    <div className="text-sm text-muted-foreground">
                        Bienvenue, {auth.user.name}
                    </div>
                </div>

                {/* Statistiques */}
                {statistiques?.stock && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Total produits actifs</div>
                                    <div className="text-2xl font-bold">{statistiques.stock.total_produits}</div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={stockRoutes.index().url}
                            className="rounded-lg border border-red-500 bg-red-50 p-4 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Produits en stock bas</div>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {statistiques.stock.produits_stock_bas}
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </Link>
                    </div>
                )}

                {/* Actions rapides */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link
                        href={stockRoutes.create().url}
                        className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary p-3">
                                <Package className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <div className="font-semibold">Nouveau produit</div>
                                <div className="text-sm text-muted-foreground">Ajouter un produit au stock</div>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={stockRoutes.index().url}
                        className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-muted p-3">
                                <History className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="font-semibold">Gérer le stock</div>
                                <div className="text-sm text-muted-foreground">Voir tous les produits</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Produits en stock bas */}
                {produits_stock_bas && produits_stock_bas.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Produits en stock bas</h2>
                            <Link
                                href={stockRoutes.index().url}
                                className="text-sm text-primary hover:underline"
                            >
                                Voir tout
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {produits_stock_bas.map((produit) => (
                                <Link
                                    key={produit.id}
                                    href={stockRoutes.show(produit.id).url}
                                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900"
                                >
                                    <div>
                                        <div className="font-medium">{produit.nom}</div>
                                        {produit.code && (
                                            <div className="text-sm text-muted-foreground">Code: {produit.code}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {produit.stock_total_bouteilles} bouteilles
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Minimum: {produit.stock_minimum * produit.bouteilles_par_casier} bouteilles
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mouvements récents */}
                {mouvements_recents && mouvements_recents.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <h2 className="mb-4 font-semibold">Mouvements récents (7 derniers jours)</h2>
                        <div className="space-y-2">
                            {mouvements_recents.map((mouvement) => (
                                <div
                                    key={mouvement.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {mouvement.type === 'entree' ? (
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 rotate-180 text-red-600" />
                                        )}
                                        <div>
                                            <div className="font-medium">
                                                {mouvement.produit?.nom || 'Produit supprimé'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(mouvement.date_mouvement).toLocaleString('fr-CD')}
                                                {mouvement.user && ` • Par ${mouvement.user.name}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`font-semibold ${
                                                mouvement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                                            }`}
                                        >
                                            {mouvement.type === 'entree' ? '+' : '-'}
                                            {mouvement.quantite_totale_bouteilles} bouteilles
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
