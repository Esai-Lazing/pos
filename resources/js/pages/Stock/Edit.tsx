import AppLayout from '@/layouts/app-layout';
import * as stock from '@/routes/stock';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

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
        title: 'Modifier',
        href: '#',
    },
];

export default function StockEdit({ produit }: Props) {
    const [uniteMesure, setUniteMesure] = useState<'casier' | 'bouteille' | 'verre'>(
        produit.unite_mesure as 'casier' | 'bouteille' | 'verre',
    );
    
    // Déterminer la devise principale selon les prix existants
    // Par défaut, utiliser FC comme devise principale
    const hasFc = produit.prix_bouteille_fc > 0;
    const hasUsd = produit.prix_bouteille_usd > 0;
    const initialDevise = hasFc && hasUsd ? 'mixte' : hasFc ? 'fc' : hasUsd ? 'usd' : 'fc';
    const [devise, setDevise] = useState<'fc' | 'usd' | 'mixte'>(initialDevise);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${produit.nom}`} />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Modifier le produit</h1>

                <Form
                    method="put"
                    action={stock.update({ produit: produit.id }).url}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                            <input
                                type="text"
                                name="nom"
                                defaultValue={produit.nom}
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Code</label>
                            <input
                                type="text"
                                name="code"
                                defaultValue={produit.code || ''}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <select
                                name="categorie"
                                defaultValue={produit.categorie}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="boisson">Boisson</option>
                                <option value="biere">Bière</option>
                                <option value="soda">Soda</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Unité de mesure *</label>
                            <select
                                name="unite_mesure"
                                value={uniteMesure}
                                onChange={(e) => setUniteMesure(e.target.value as any)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="casier">Casier</option>
                                <option value="bouteille">Bouteille</option>
                                <option value="verre">Verre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Bouteilles par casier *</label>
                            <select
                                name="bouteilles_par_casier"
                                defaultValue={produit.bouteilles_par_casier}
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="12">12 bouteilles</option>
                                <option value="24">24 bouteilles</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Stock minimum (en casiers)
                            </label>
                            <input
                                type="number"
                                name="stock_minimum"
                                defaultValue={produit.stock_minimum}
                                min="0"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder="Ex: 1 casier"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Alerte déclenchée quand le stock atteint ce nombre de casiers
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Quantité casiers</label>
                            <input
                                type="number"
                                name="quantite_casiers"
                                defaultValue={produit.quantite_casiers}
                                min="0"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Quantité bouteilles (hors casier)
                            </label>
                            <input
                                type="number"
                                name="quantite_bouteilles"
                                defaultValue={produit.quantite_bouteilles}
                                min="0"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Bouteilles non regroupées en casiers complets
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Devise principale *</label>
                            <select
                                value={devise}
                                onChange={(e) => setDevise(e.target.value as 'fc' | 'usd' | 'mixte')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="fc">Franc Congolais (FC)</option>
                                <option value="usd">Dollar (USD)</option>
                                <option value="mixte">Mixte (FC + USD)</option>
                            </select>
                        </div>

                        {(devise === 'fc' || devise === 'mixte') && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix casier (FC) {devise === 'fc' && '*'}
                                    </label>
                                    <input
                                        type="number"
                                        name="prix_casier_fc"
                                        defaultValue={produit.prix_casier_fc}
                                        step="0.01"
                                        min="0"
                                        required={devise === 'fc'}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix bouteille (FC) *
                                    </label>
                                    <input
                                        type="number"
                                        name="prix_bouteille_fc"
                                        defaultValue={produit.prix_bouteille_fc}
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    />
                                </div>
                            </>
                        )}

                        {(devise === 'usd' || devise === 'mixte') && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix casier (USD) {devise === 'usd' && '*'}
                                    </label>
                                    <input
                                        type="number"
                                        name="prix_casier_usd"
                                        defaultValue={produit.prix_casier_usd}
                                        step="0.01"
                                        min="0"
                                        required={devise === 'usd'}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prix bouteille (USD) {devise === 'usd' && '*'}
                                    </label>
                                    <input
                                        type="number"
                                        name="prix_bouteille_usd"
                                        defaultValue={produit.prix_bouteille_usd}
                                        step="0.01"
                                        min="0"
                                        required={devise === 'usd'}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="est_actif"
                                    defaultChecked={produit.est_actif}
                                    className="rounded border-input"
                                />
                                <span className="text-sm font-medium">Produit actif</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <a
                            href={stock.show({ produit: produit.id }).url}
                            className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            Annuler
                        </a>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            Enregistrer
                        </button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
}

