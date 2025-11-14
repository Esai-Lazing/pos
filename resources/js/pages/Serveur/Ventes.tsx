import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { Receipt, ArrowLeft, Printer } from 'lucide-react';

interface Vente {
    id: number;
    numero_facture: string;
    montant_total_fc: string;
    montant_total_usd: string;
    created_at: string;
    est_imprime: boolean;
    items?: Array<{
        produit: {
            nom: string;
        };
        quantite: number;
        sous_total_fc: string;
    }>;
}

interface Props {
    ventes: {
        data: Vente[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function ServeurVentes({ ventes }: Props) {
    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/serveur/dashboard"
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Mes Factures</h1>
                        <p className="text-muted-foreground">Historique de vos ventes</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Facture</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Montant FC</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Montant USD</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            <Receipt className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>Aucune vente trouvée</p>
                                        </td>
                                    </tr>
                                ) : (
                                    ventes.data.map((vente) => (
                                        <tr key={vente.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 font-mono text-sm font-semibold">
                                                {vente.numero_facture}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(vente.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {parseFloat(vente.montant_total_fc).toLocaleString('fr-CD')} FC
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {parseFloat(vente.montant_total_usd).toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {vente.est_imprime ? (
                                                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
                                                        Imprimée
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-500">
                                                        Non imprimée
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/serveur/vente/${vente.id}`}
                                                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    Voir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {ventes.last_page > 1 && (
                        <div className="border-t border-border p-4">
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: ventes.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/serveur/vente?page=${page}`}
                                        className={`rounded-lg px-3 py-1 ${
                                            page === ventes.current_page
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

