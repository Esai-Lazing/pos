import AppLayout from '@/layouts/app-layout';
import * as venteRoutes from '@/routes/vente';
import { type BreadcrumbItem } from '@/types';
import { type Vente } from '@/types/vente';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, DollarSign, Package, Plus, Receipt } from 'lucide-react';

interface Props {
    ventes: {
        data: Vente[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    periode: 'jour' | 'semaine' | 'mois';
    date_debut: string;
    date_fin: string;
    statistiques: {
        total_ventes_fc: number;
        total_ventes_usd: number;
        nombre_ventes: number;
    };
    filters: {
        periode?: string;
        user_id?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ventes',
        href: venteRoutes.index().url,
    },
];

export default function VenteIndex({
    ventes,
    periode,
    date_debut,
    date_fin,
    statistiques,
    filters,
}: Props) {
    const [selectedPeriode, setSelectedPeriode] = useState(periode);

    const handlePeriodeChange = (newPeriode: 'jour' | 'semaine' | 'mois') => {
        setSelectedPeriode(newPeriode);
        router.get(
            venteRoutes.index().url,
            { periode: newPeriode },
            { preserveState: true }
        );
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('fr-CD', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPeriodeLabel = (): string => {
        switch (periode) {
            case 'jour':
                return "Aujourd'hui";
            case 'semaine':
                return 'Cette semaine';
            case 'mois':
                return 'Ce mois';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historique des Ventes" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Historique des Ventes</h1>
                        <p className="text-sm text-muted-foreground">{getPeriodeLabel()}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={venteRoutes.create().url}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle Vente
                        </Link>
                    </div>
                </div>

                {/* Filtres de période */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePeriodeChange('jour')}
                        className={`rounded-lg px-4 py-2 ${
                            selectedPeriode === 'jour'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        Jour
                    </button>
                    <button
                        onClick={() => handlePeriodeChange('semaine')}
                        className={`rounded-lg px-4 py-2 ${
                            selectedPeriode === 'semaine'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        Semaine
                    </button>
                    <button
                        onClick={() => handlePeriodeChange('mois')}
                        className={`rounded-lg px-4 py-2 ${
                            selectedPeriode === 'mois'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        Mois
                    </button>
                </div>

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="text-sm text-muted-foreground">Total Ventes FC</div>
                                <div className="text-2xl font-bold">
                                    {Number(statistiques.total_ventes_fc).toLocaleString('fr-CD')} FC
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="text-sm text-muted-foreground">Total Ventes USD</div>
                                <div className="text-2xl font-bold">
                                    ${Number(statistiques.total_ventes_usd).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="text-sm text-muted-foreground">Nombre de ventes</div>
                                <div className="text-2xl font-bold">{statistiques.nombre_ventes}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des ventes */}
                <div className="rounded-lg border border-border bg-card">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold">Liste des ventes</h2>
                    </div>
                    <div className="divide-y divide-border">
                        {ventes.data.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Receipt className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>Aucune vente enregistrée pour cette période</p>
                            </div>
                        ) : (
                            ventes.data.map((vente) => {
                                const modePaiement = vente.mode_paiement || 'fc';
                                const afficherFC = modePaiement === 'fc' || modePaiement === 'mixte';
                                const afficherUSD = modePaiement === 'usd' || modePaiement === 'mixte';

                                return (
                                    <Link
                                        key={vente.id}
                                        href={venteRoutes.show(vente.id).url}
                                        className="block p-4 hover:bg-accent"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold">{vente.numero_facture}</span>
                                                    {vente.est_imprime && (
                                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Imprimé
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(vente.created_at)}
                                                    </div>
                                                    {vente.user && (
                                                        <div>Par: {vente.user.name}</div>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex gap-4">
                                                    {afficherFC && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Total FC: </span>
                                                            <span className="font-medium">
                                                                {Number(vente.montant_total_fc).toLocaleString('fr-CD')} FC
                                                            </span>
                                                        </div>
                                                    )}
                                                    {afficherUSD && Number(vente.montant_total_usd || 0) > 0 && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Total USD: </span>
                                                            <span className="font-medium">
                                                                ${Number(vente.montant_total_usd || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    {vente.items?.length || 0} article(s)
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {ventes.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-border p-4">
                            <div className="text-sm text-muted-foreground">
                                Page {ventes.current_page} sur {ventes.last_page}
                            </div>
                            <div className="flex gap-2">
                                {ventes.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get(
                                                venteRoutes.index().url,
                                                { ...filters, page: ventes.current_page - 1 },
                                                { preserveState: true }
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                                    >
                                        Précédent
                                    </button>
                                )}
                                {ventes.current_page < ventes.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get(
                                                venteRoutes.index().url,
                                                { ...filters, page: ventes.current_page + 1 },
                                                { preserveState: true }
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                                    >
                                        Suivant
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


