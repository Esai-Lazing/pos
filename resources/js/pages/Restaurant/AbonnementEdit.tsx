import AppLayout from '@/layouts/app-layout';
import { Form } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Abonnement {
    id?: number;
    plan: string;
    montant_mensuel: string;
    date_debut: string;
    date_fin?: string;
    statut: string;
    est_actif: boolean;
    notes?: string;
}

interface Restaurant {
    id: number;
    nom: string;
}

interface Props {
    restaurant: Restaurant;
    abonnement?: Abonnement;
}

export default function AbonnementEdit({ restaurant, abonnement }: Props) {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/restaurant/${restaurant.id}`}
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Gérer l'abonnement</h1>
                        <p className="text-muted-foreground">Restaurant: {restaurant.nom}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <Form
                        action={`/restaurant/${restaurant.id}/abonnement`}
                        method="put"
                        className="space-y-6"
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="plan" className="mb-2 block text-sm font-medium">
                                    Plan d'abonnement *
                                </label>
                                <select
                                    id="plan"
                                    name="plan"
                                    required
                                    defaultValue={abonnement?.plan || 'basique'}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="basique">Basique</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="montant_mensuel" className="mb-2 block text-sm font-medium">
                                    Montant mensuel (USD) *
                                </label>
                                <input
                                    type="number"
                                    id="montant_mensuel"
                                    name="montant_mensuel"
                                    step="0.01"
                                    min="0"
                                    required
                                    defaultValue={abonnement?.montant_mensuel || ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="date_debut" className="mb-2 block text-sm font-medium">
                                    Date de début *
                                </label>
                                <input
                                    type="date"
                                    id="date_debut"
                                    name="date_debut"
                                    required
                                    defaultValue={abonnement?.date_debut ? abonnement.date_debut.split('T')[0] : ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="date_fin" className="mb-2 block text-sm font-medium">
                                    Date de fin (optionnel)
                                </label>
                                <input
                                    type="date"
                                    id="date_fin"
                                    name="date_fin"
                                    defaultValue={abonnement?.date_fin ? abonnement.date_fin.split('T')[0] : ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="statut" className="mb-2 block text-sm font-medium">
                                    Statut *
                                </label>
                                <select
                                    id="statut"
                                    name="statut"
                                    required
                                    defaultValue={abonnement?.statut || 'actif'}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="actif">Actif</option>
                                    <option value="suspendu">Suspendu</option>
                                    <option value="expire">Expiré</option>
                                    <option value="annule">Annulé</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Actif</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="est_actif"
                                        name="est_actif"
                                        value="1"
                                        defaultChecked={abonnement?.est_actif ?? true}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <label htmlFor="est_actif" className="text-sm">
                                        Abonnement actif
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="mb-2 block text-sm font-medium">
                                Notes (optionnel)
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                defaultValue={abonnement?.notes || ''}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                                <Save className="h-4 w-4" />
                                Enregistrer
                            </button>
                            <Link
                                href={`/restaurant/${restaurant.id}`}
                                className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                            >
                                Annuler
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

