import AppLayout from '@/layouts/app-layout';
import * as stock from '@/routes/stock';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Package, Search } from 'lucide-react';
import { useState } from 'react';

interface Produit {
    id: number;
    nom: string;
    code: string | null;
    quantite_casiers: number;
    quantite_bouteilles: number;
    bouteilles_par_casier: number;
    stock_minimum: number;
    prix_bouteille_fc: string;
    prix_bouteille_usd: string;
    est_actif: boolean;
    stock_total_bouteilles: number;
    stock_bas: boolean;
}

interface Props {
    produits: {
        data: Produit[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        categorie?: string;
        stock_bas?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stock',
        href: stock.index().url,
    },
];

export default function StockIndex({ produits, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(stock.index().url, { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion du Stock" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gestion du Stock</h1>
                    <Link
                        href={stock.create().url}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Produit
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2"
                        />
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {produits.data.map((produit) => (
                        <Link
                            key={produit.id}
                            href={stock.show({ produit: produit.id }).url}
                            className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                                produit.stock_bas
                                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30'
                                    : 'border-border bg-card hover:bg-accent'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${produit.stock_bas ? 'text-red-700 dark:text-red-300' : ''}`}>
                                        {produit.nom}
                                    </h3>
                                    {produit.code && (
                                        <p className={`text-sm ${produit.stock_bas ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                            Code: {produit.code}
                                        </p>
                                    )}
                                </div>
                                {produit.stock_bas && (
                                    <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                                        Stock bas
                                    </span>
                                )}
                            </div>
                            <div className={`mt-4 flex items-center gap-2 ${produit.stock_bas ? 'text-red-700 dark:text-red-300' : ''}`}>
                                <Package className={`h-4 w-4 ${produit.stock_bas ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-medium">
                                    {produit.quantite_casiers} casiers, {produit.quantite_bouteilles} bouteilles (hors casier)
                                </span>
                            </div>
                            <div className={`mt-2 text-sm font-semibold ${produit.stock_bas ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'}`}>
                                Total: {produit.stock_total_bouteilles} bouteilles
                            </div>
                            <div className="mt-2 text-sm font-semibold">
                                {parseFloat(produit.prix_bouteille_fc).toLocaleString('fr-CD')} FC
                            </div>
                        </Link>
                    ))}
                </div>

                {produits.data.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun produit trouvé
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

