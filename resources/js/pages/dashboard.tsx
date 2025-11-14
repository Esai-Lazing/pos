import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import * as venteRoutes from '@/routes/vente';
import * as stockRoutes from '@/routes/stock';
import * as rapportRoutes from '@/routes/rapport';
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
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Statistiques {
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

interface Props {
    role: 'admin' | 'caisse' | 'stock';
    statistiques?: Statistiques;
    produits_vendus?: ProduitVendu[];
    dernieres_ventes?: Vente[];
    produits_stock_bas?: ProduitStockBas[];
    mouvements_recents?: MouvementStock[];
}

export default function Dashboard({
    role,
    statistiques,
    produits_vendus,
    dernieres_ventes,
    produits_stock_bas,
    mouvements_recents,
}: Props) {
    const { auth } = usePage<SharedData>().props;

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
