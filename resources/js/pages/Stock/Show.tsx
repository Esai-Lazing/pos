import AppLayout from '@/layouts/app-layout';
import * as stock from '@/routes/stock';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, Form, router } from '@inertiajs/react';
import { Edit, Package, TrendingDown, TrendingUp, History, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface StockMovement {
    id: number;
    type: string;
    quantite_casiers: number;
    quantite_bouteilles: number;
    quantite_verres: number;
    quantite_totale_bouteilles: number;
    prix_achat_fc: number | null;
    prix_achat_usd: number | null;
    raison: string | null;
    reference_fournisseur: string | null;
    date_mouvement: string;
    user: {
        id: number;
        name: string;
    } | null;
}

interface Produit {
    id: number;
    nom: string;
    code: string | null;
    description: string | null;
    categorie: string;
    unite_mesure: string;
    bouteilles_par_casier: number;
    quantite_casiers: number;
    quantite_bouteilles: number;
    quantite_verres: number;
    stock_minimum: number;
    prix_casier_fc: number;
    prix_casier_usd: number;
    prix_bouteille_fc: number;
    prix_bouteille_usd: number;
    est_actif: boolean;
    stock_total_bouteilles: number;
    stock_bas: boolean;
    stock_movements?: StockMovement[];
    vente_items?: Array<{
        id: number;
        vente: {
            id: number;
            numero_facture: string;
            created_at: string;
        };
    }>;
}

interface Props {
    produit: Produit;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stock',
        href: stock.index().url,
    },
    {
        title: 'Détails',
        href: '#',
    },
];

export default function StockShow({ produit }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const stockTotal = produit.stock_total_bouteilles || 
        (produit.quantite_casiers * produit.bouteilles_par_casier + produit.quantite_bouteilles);

    const handleDelete = () => {
        router.delete(stock.destroy(produit.id).url, {
            onSuccess: () => {
                router.visit(stock.index().url);
            },
            onError: () => {
                setShowDeleteConfirm(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${produit.nom} - Détails`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{produit.nom}</h1>
                        {produit.code && (
                            <p className="text-sm text-muted-foreground">Code: {produit.code}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={stock.edit({ produit: produit.id }).url}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            <Edit className="h-4 w-4" />
                            Modifier
                        </Link>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 rounded-lg border border-red-500 bg-background px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    Confirmer
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                        <Link
                            href={stock.index().url}
                            className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            Retour
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        {/* Informations générales */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h2 className="mb-4 font-semibold">Informations générales</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm text-muted-foreground">Catégorie</label>
                                    <p className="font-medium">{produit.categorie}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Unité de mesure</label>
                                    <p className="font-medium capitalize">{produit.unite_mesure}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Bouteilles par casier</label>
                                    <p className="font-medium">{produit.bouteilles_par_casier}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Stock minimum (casiers)</label>
                                    <p className="font-medium">
                                        {produit.stock_minimum} casier{produit.stock_minimum > 1 ? 's' : ''} 
                                        ({produit.stock_minimum * produit.bouteilles_par_casier} bouteilles)
                                    </p>
                                </div>
                                {produit.description && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-muted-foreground">Description</label>
                                        <p className="font-medium">{produit.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stock actuel */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Stock actuel</h2>
                                {produit.stock_bas && (
                                    <span className="rounded-full bg-red-500 px-3 py-1 text-sm text-white">
                                        Stock bas
                                    </span>
                                )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Casiers</p>
                                        <p className="text-2xl font-bold">{produit.quantite_casiers}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bouteilles (hors casier)</p>
                                        <p className="text-2xl font-bold">{produit.quantite_bouteilles}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total (bouteilles)</p>
                                        <p className="text-2xl font-bold">{stockTotal}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prix */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h2 className="mb-4 font-semibold">Prix</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm text-muted-foreground">Prix casier (FC)</label>
                                    <p className="font-medium">{Number(produit.prix_casier_fc).toLocaleString('fr-CD')} FC</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Prix bouteille (FC)</label>
                                    <p className="font-medium">{Number(produit.prix_bouteille_fc).toLocaleString('fr-CD')} FC</p>
                                </div>
                                {Number(produit.prix_casier_usd) > 0 && (
                                    <div>
                                        <label className="text-sm text-muted-foreground">Prix casier (USD)</label>
                                        <p className="font-medium">${Number(produit.prix_casier_usd).toFixed(2)}</p>
                                    </div>
                                )}
                                {Number(produit.prix_bouteille_usd) > 0 && (
                                    <div>
                                        <label className="text-sm text-muted-foreground">Prix bouteille (USD)</label>
                                        <p className="font-medium">${Number(produit.prix_bouteille_usd).toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Historique des mouvements */}
                        {produit.stock_movements && produit.stock_movements.length > 0 && (
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <History className="h-5 w-5" />
                                    <h2 className="font-semibold">Historique des mouvements</h2>
                                </div>
                                <div className="space-y-2">
                                    {produit.stock_movements.map((movement) => (
                                        <div
                                            key={movement.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {movement.type === 'entree' ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium capitalize">{movement.type}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {movement.quantite_casiers > 0 && `${movement.quantite_casiers} casiers `}
                                                        {movement.quantite_bouteilles > 0 && `${movement.quantite_bouteilles} bouteilles `}
                                                        {movement.quantite_verres > 0 && `${movement.quantite_verres} verres`}
                                                    </p>
                                                    {movement.raison && (
                                                        <p className="text-xs text-muted-foreground">{movement.raison}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(movement.date_mouvement).toLocaleDateString('fr-CD')}
                                                </p>
                                                {movement.user && (
                                                    <p className="text-xs text-muted-foreground">{movement.user.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions rapides */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-lg border border-border bg-card p-4">
                            <h3 className="mb-4 font-semibold">Actions rapides</h3>
                            <div className="space-y-2">
                                <Form
                                    method="post"
                                    action={stock.mouvement().url}
                                    className="space-y-4"
                                >
                                    <input type="hidden" name="produit_id" value={produit.id} />
                                    <input type="hidden" name="type" value="entree" />
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ajouter du stock</label>
                                        <input
                                            type="number"
                                            name="quantite_casiers"
                                            placeholder="Casiers"
                                            min="0"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 mb-2"
                                        />
                                        <input
                                            type="number"
                                            name="quantite_bouteilles"
                                            placeholder="Bouteilles (hors casier)"
                                            min="0"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                    >
                                        Ajouter au stock
                                    </button>
                                </Form>

                                <Form
                                    method="post"
                                    action={stock.mouvement().url}
                                    className="space-y-4"
                                >
                                    <input type="hidden" name="produit_id" value={produit.id} />
                                    <input type="hidden" name="type" value="sortie" />
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Retirer du stock</label>
                                        <input
                                            type="number"
                                            name="quantite_casiers"
                                            placeholder="Casiers"
                                            min="0"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 mb-2"
                                        />
                                        <input
                                            type="number"
                                            name="quantite_bouteilles"
                                            placeholder="Bouteilles (hors casier)"
                                            min="0"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                    >
                                        Retirer du stock
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

