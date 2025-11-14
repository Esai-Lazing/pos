import AppLayout from '@/layouts/app-layout';
import * as vente from '@/routes/vente';
import { type BreadcrumbItem } from '@/types';
import { Form } from '@inertiajs/react';
import { ShoppingCart, Trash2, Search, Package, Plus, X } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Produit {
    id: number;
    nom: string;
    code: string | null;
    prix_bouteille_fc: string;
    prix_bouteille_usd: string;
    prix_casier_fc: string;
    prix_casier_usd: string;
    stock_total_bouteilles: number;
}

interface Printer {
    id: number;
    nom: string;
    type: string;
}

interface Props {
    produits: Produit[];
    printer: Printer | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vente',
        href: vente.index().url,
    },
    {
        title: 'Nouvelle Vente',
        href: vente.create().url,
    },
];

interface VenteItem {
    produit_id: number;
    produit?: Produit;
    unite: 'casier' | 'bouteille';
    quantite: number;
    prix_unitaire_fc: number;
    prix_unitaire_usd: number;
}

export default function VenteCreate({ produits, printer }: Props) {
    const [items, setItems] = useState<VenteItem[]>([]);
    const [selectedProduit, setSelectedProduit] = useState<number | null>(null);
    const [unite, setUnite] = useState<'casier' | 'bouteille'>('bouteille');
    const [quantite, setQuantite] = useState(1);
    const [montantPayeFc, setMontantPayeFc] = useState(0);
    const [montantPayeUsd, setMontantPayeUsd] = useState(0);
    const [modePaiement, setModePaiement] = useState<'fc' | 'usd' | 'mixte'>('fc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);

    const filteredProduits = useMemo(() => {
        if (!searchQuery.trim()) {
            return produits;
        }
        const query = searchQuery.toLowerCase();
        return produits.filter(
            (p) =>
                p.nom.toLowerCase().includes(query) ||
                p.code?.toLowerCase().includes(query),
        );
    }, [produits, searchQuery]);

    const handleProductClick = (produitId: number) => {
        setSelectedProduit(produitId);
        setUnite('bouteille');
        setQuantite(1);
        setShowProductModal(true);
    };

    const addItem = () => {
        if (!selectedProduit) {
            return;
        }

        const produit = produits.find((p) => p.id === selectedProduit);
        if (!produit) {
            return;
        }

        const prixFc = parseFloat(
            unite === 'casier' ? produit.prix_casier_fc : produit.prix_bouteille_fc,
        );
        const prixUsd = parseFloat(
            unite === 'casier' ? produit.prix_casier_usd : produit.prix_bouteille_usd,
        );

        setItems([
            ...items,
            {
                produit_id: produit.id,
                produit,
                unite,
                quantite,
                prix_unitaire_fc: prixFc,
                prix_unitaire_usd: prixUsd,
            },
        ]);

        setSelectedProduit(null);
        setQuantite(1);
        setShowProductModal(false);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalFc = items.reduce((sum, item) => sum + item.prix_unitaire_fc * item.quantite, 0);
    const totalUsd = items.reduce((sum, item) => sum + item.prix_unitaire_usd * item.quantite, 0);
    const renduFc = Math.max(0, montantPayeFc - totalFc);
    const renduUsd = Math.max(0, montantPayeUsd - totalUsd);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Nouvelle Vente</h1>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-4 font-semibold">Sélectionner un produit</h2>
                            
                            {/* Barre de recherche */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit par nom ou code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Grille de produits */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {filteredProduits.length === 0 ? (
                                    <div className="col-span-full py-8 text-center text-muted-foreground">
                                        <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                        <p>Aucun produit trouvé</p>
                                    </div>
                                ) : (
                                    filteredProduits.map((produit) => {
                                        const isLowStock = produit.stock_total_bouteilles < 10;
                                        const prixBouteilleFc = parseFloat(produit.prix_bouteille_fc);
                                        
                                        return (
                                            <button
                                                key={produit.id}
                                                type="button"
                                                onClick={() => handleProductClick(produit.id)}
                                                disabled={produit.stock_total_bouteilles === 0}
                                                className="group relative flex flex-col rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:shadow-none"
                                            >
                                                {/* Badge stock bas */}
                                                {isLowStock && produit.stock_total_bouteilles > 0 && (
                                                    <span className="absolute right-2 top-2 rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                        Bas
                                                    </span>
                                                )}
                                                
                                                {/* Indicateur stock épuisé */}
                                                {produit.stock_total_bouteilles === 0 && (
                                                    <span className="absolute right-2 top-2 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                        Épuisé
                                                    </span>
                                                )}

                                                {/* Nom produit */}
                                                <div className="mb-2 font-semibold text-lg leading-tight group-hover:text-primary">
                                                    {produit.nom}
                                                </div>

                                                {/* Prix */}
                                                <div className="mt-auto text-sm font-medium text-primary">
                                                    {prixBouteilleFc.toLocaleString('fr-CD')} FC
                                                </div>

                                                {/* Icône plus au hover */}
                                                <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Plus className="h-5 w-5 text-primary" />
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-4 font-semibold">Articles</h2>
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
                                    Aucun article ajouté
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-border p-3"
                                        >
                                            <div>
                                                <div className="font-medium">{item.produit?.nom}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.quantite} {item.unite}(s) ×{' '}
                                                    {item.prix_unitaire_fc.toLocaleString('fr-CD')} FC
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="font-semibold">
                                                    {(item.prix_unitaire_fc * item.quantite).toLocaleString('fr-CD')} FC
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-destructive hover:text-destructive/80"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal pour sélectionner unité et quantité */}
                    {showProductModal && selectedProduit && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Ajouter au panier</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowProductModal(false);
                                            setSelectedProduit(null);
                                        }}
                                        className="rounded-lg p-1 hover:bg-muted"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {(() => {
                                    const produit = produits.find((p) => p.id === selectedProduit);
                                    if (!produit) return null;

                                    return (
                                        <div className="space-y-4">
                                            <div>
                                                <div className="font-semibold">{produit.nom}</div>
                                                {produit.code && (
                                                    <div className="text-sm text-muted-foreground">Code: {produit.code}</div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Unité</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setUnite('bouteille')}
                                                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                                                            unite === 'bouteille'
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-background hover:bg-muted'
                                                        }`}
                                                    >
                                                        Bouteille
                                                        <div className="text-xs opacity-80">
                                                            {parseFloat(produit.prix_bouteille_fc).toLocaleString('fr-CD')} FC
                                                        </div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setUnite('casier')}
                                                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                                                            unite === 'casier'
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-background hover:bg-muted'
                                                        }`}
                                                    >
                                                        Casier
                                                        <div className="text-xs opacity-80">
                                                            {parseFloat(produit.prix_casier_fc).toLocaleString('fr-CD')} FC
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Quantité</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantite(Math.max(1, quantite - 1))}
                                                        className="rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={quantite}
                                                        onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))}
                                                        min="1"
                                                        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-center"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantite(quantite + 1)}
                                                        className="rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={addItem}
                                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                                                >
                                                    Ajouter
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowProductModal(false);
                                                        setSelectedProduit(null);
                                                    }}
                                                    className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-4 font-semibold">Résumé</h2>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total FC:</span>
                                        <span className="font-semibold">{totalFc.toLocaleString('fr-CD')} FC</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total USD:</span>
                                        <span className="font-semibold">${totalUsd.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium mb-2">Mode de paiement</label>
                                    <select
                                        value={modePaiement}
                                        onChange={(e) =>
                                            setModePaiement(e.target.value as 'fc' | 'usd' | 'mixte')
                                        }
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    >
                                        <option value="fc">FC uniquement</option>
                                        <option value="usd">USD uniquement</option>
                                        <option value="mixte">Mixte</option>
                                    </select>
                                </div>

                                {modePaiement !== 'usd' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Montant payé (FC)</label>
                                        <input
                                            type="number"
                                            value={montantPayeFc}
                                            onChange={(e) => setMontantPayeFc(Number(e.target.value))}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                        />
                                    </div>
                                )}

                                {modePaiement !== 'fc' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Montant payé (USD)</label>
                                        <input
                                            type="number"
                                            value={montantPayeUsd}
                                            onChange={(e) => setMontantPayeUsd(Number(e.target.value))}
                                            step="0.01"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                        />
                                    </div>
                                )}

                                {renduFc > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        Rendu: {renduFc.toLocaleString('fr-CD')} FC
                                    </div>
                                )}
                                {renduUsd > 0 && (
                                    <div className="text-sm text-muted-foreground">Rendu: ${renduUsd.toFixed(2)}</div>
                                )}

                                <Form
                                    method="post"
                                    action={vente.store().url}
                                    onSubmit={(e) => {
                                        if (items.length === 0) {
                                            e.preventDefault();
                                            alert('Veuillez ajouter au moins un article');
                                        }
                                    }}
                                >
                                    <input type="hidden" name="items" value={JSON.stringify(items)} />
                                    <input type="hidden" name="montant_paye_fc" value={montantPayeFc} />
                                    <input type="hidden" name="montant_paye_usd" value={montantPayeUsd} />
                                    <input type="hidden" name="mode_paiement" value={modePaiement} />

                                    <button
                                        type="submit"
                                        disabled={items.length === 0}
                                        className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Valider la vente
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

