import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { ShoppingCart, Receipt, LogOut } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function ServeurDashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tableau de bord Serveur</h1>
                        <p className="text-muted-foreground">Bienvenue, {auth.user?.name}</p>
                    </div>
                    <form action="/serveur/logout" method="post">
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </form>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Link
                        href="/serveur/vente/create"
                        className="group flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
                    >
                        <div className="mb-4 rounded-full bg-primary/10 p-4">
                            <ShoppingCart className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
                            Nouvelle Vente
                        </h2>
                        <p className="text-center text-muted-foreground">
                            Créer une nouvelle vente et générer une facture
                        </p>
                    </Link>

                    <Link
                        href="/serveur/vente"
                        className="group flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
                    >
                        <div className="mb-4 rounded-full bg-primary/10 p-4">
                            <Receipt className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
                            Mes Factures
                        </h2>
                        <p className="text-center text-muted-foreground">
                            Voir l'historique de vos ventes et réimprimer les factures
                        </p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

