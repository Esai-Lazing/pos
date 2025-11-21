import AppLayout from '@/layouts/app-layout';
import { Form } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function RestaurantCreate() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/restaurant"
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nouveau Restaurant</h1>
                        <p className="text-muted-foreground">Créer un nouveau restaurant et son abonnement</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <Form action="/restaurant" method="post" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="nom" className="mb-2 block text-sm font-medium">
                                    Nom du restaurant *
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="telephone" className="mb-2 block text-sm font-medium">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="plan" className="mb-2 block text-sm font-medium">
                                    Plan d'abonnement *
                                </label>
                                <select
                                    id="plan"
                                    name="plan"
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="simple">Starter</option>
                                    <option value="medium">Business</option>
                                    <option value="premium">Pro</option>
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
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                                Créer le restaurant
                            </button>
                            <Link
                                href="/restaurant"
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

