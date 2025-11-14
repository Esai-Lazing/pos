import AppLayout from '@/layouts/app-layout';
import * as venteRoutes from '@/routes/vente';
import { type BreadcrumbItem } from '@/types';
import { Form } from '@inertiajs/react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Vente as VenteType } from '@/types/vente';

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
    vente: VenteType;
    produits: Produit[];
    printer: Printer | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vente',
        href: venteRoutes.index().url,
    },
    {
        title: 'Modifier',
        href: '#',
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

export default function VenteEdit({ vente, produits, printer }: Props) {
    // Initialiser les items depuis la vente existante
    const initialItems: VenteItem[] = vente.items?.map((item) => {
        const produit = produits.find((p) => p.id === item.produit_id);
        return {
            produit_id: item.produit_id,
            produit: produit || item.produit ? {
                id: produit?.id || item.produit?.id || 0,
                nom: produit?.nom || item.produit?.nom || '',
                code: produit?.code || item.produit?.code || null,
                prix_bouteille_fc: produit?.prix_bouteille_fc || String(item.prix_unitaire_fc),
                prix_bouteille_usd: produit?.prix_bouteille_usd || String(item.prix_unitaire_usd || 0),
                prix_casier_fc: produit?.prix_casier_fc || String(item.prix_unitaire_fc),
                prix_casier_usd: produit?.prix_casier_usd || String(item.prix_unitaire_usd || 0),
                stock_total_bouteilles: produit?.stock_total_bouteilles || 0,
            } : undefined,
            unite: item.unite as 'casier' | 'bouteille',
            quantite: item.quantite,
            prix_unitaire_fc: Number(item.prix_unitaire_fc),
            prix_unitaire_usd: Number(item.prix_unitaire_usd || 0),
        };
    }) || [];

    const [items, setItems] = useState<VenteItem[]>(initialItems);
    const [selectedProduit, setSelectedProduit] = useState<number | null>(null);
    const [unite, setUnite] = useState<'casier' | 'bouteille'>('bouteille');
    const [quantite, setQuantite] = useState(1);
    const [montantPayeFc, setMontantPayeFc] = useState(Number(vente.montant_paye_fc));
    const [montantPayeUsd, setMontantPayeUsd] = useState(Number(vente.montant_paye_usd || 0));
    const [modePaiement, setModePaiement] = useState<'fc' | 'usd' | 'mixte'>(
        vente.mode_paiement || 'fc'
    );

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
                <h1 className="text-2xl font-bold">Modifier la vente {vente.numero_facture}</h1>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-4 font-semibold">Ajouter un produit</h2>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProduit || ''}
                                    onChange={(e) => setSelectedProduit(Number(e.target.value) || null)}
                                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {produits.map((produit) => (
                                        <option key={produit.id} value={produit.id}>
                                            {produit.nom} ({produit.stock_total_bouteilles} bouteilles)
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={unite}
                                    onChange={(e) => setUnite(e.target.value as 'casier' | 'bouteille')}
                                    className="rounded-lg border border-input bg-background px-3 py-2"
                                >
                                    <option value="casier">Casier</option>
                                    <option value="bouteille">Bouteille</option>
                                </select>
                                <input
                                    type="number"
                                    value={quantite}
                                    onChange={(e) => setQuantite(Number(e.target.value))}
                                    min="1"
                                    className="w-20 rounded-lg border border-input bg-background px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                                >
                                    Ajouter
                                </button>
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
                                    method="put"
                                    action={venteRoutes.update({ vente: vente.id }).url}
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

                                    <div className="flex gap-2">
                                        <a
                                            href={venteRoutes.show({ vente: vente.id }).url}
                                            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-center hover:bg-accent"
                                        >
                                            Annuler
                                        </a>
                                        <button
                                            type="submit"
                                            disabled={items.length === 0}
                                            className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

