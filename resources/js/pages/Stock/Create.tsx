import AppLayout from '@/layouts/app-layout';
import * as stock from '@/routes/stock';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stock',
        href: stock.index().url,
    },
    {
        title: 'Nouveau Produit',
        href: stock.create().url,
    },
];

export default function StockCreate() {
    const [uniteMesure, setUniteMesure] = useState<'casier' | 'bouteille' | 'verre'>('bouteille');
    const [devise, setDevise] = useState<'fc' | 'usd' | 'mixte'>('fc');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Produit" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Nouveau Produit</h1>

                <Form
                    method="post"
                    action={stock.store().url}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom du produit *</label>
                            <input
                                type="text"
                                name="nom"
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Code <span className="text-xs text-muted-foreground">(optionnel - généré automatiquement)</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                placeholder="Laissé vide pour génération automatique"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <select
                                name="categorie"
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
                                defaultValue={24}
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
                                defaultValue={1}
                                min="0"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder="Ex: 1 casier"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Alerte déclenchée quand le stock atteint ce nombre de casiers
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
                                        step="0.01"
                                        min="0"
                                        required={devise === 'usd'}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <a
                            href={stock.index().url}
                            className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            Annuler
                        </a>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            Créer
                        </button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
}

