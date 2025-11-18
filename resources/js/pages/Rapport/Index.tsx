import AppLayout from '@/layouts/app-layout';
import * as rapport from '@/routes/rapports';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, DollarSign, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    periode: string;
    date_debut: string;
    date_fin: string;
    statistiques: {
        total_ventes_fc: number;
        total_ventes_usd: number;
        nombre_ventes: number;
        total_benefice_fc: number;
        total_benefice_usd: number;
        variation?: number;
        total_ventes_precedentes_fc?: number;
    };
    produits_vendus: Array<{
        produit: {
            id: number;
            nom: string;
        };
        quantite: number;
        total_fc: number;
        total_usd: number;
    }>;
    ventes_par_jour: Array<{
        date: string;
        total_fc: number;
        total_usd: number;
        nombre: number;
    }>;
    ventes_par_heure?: Array<{
        heure: string;
        total_fc: number;
        nombre: number;
    }>;
    ventes_par_mode_paiement?: Array<{
        mode: string;
        total_fc: number;
        nombre: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rapports',
        href: rapport.index().url,
    },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const getModePaiementLabel = (mode: string): string => {
    const labels: Record<string, string> = {
        fc: 'Franc Congolais',
        usd: 'Dollar US',
        mixte: 'Mixte',
    };
    return labels[mode] || mode;
};

export default function RapportIndex({
    periode,
    date_debut,
    date_fin,
    statistiques,
    produits_vendus,
    ventes_par_jour,
    ventes_par_heure,
    ventes_par_mode_paiement,
}: Props) {
    const [selectedPeriode, setSelectedPeriode] = useState(periode);

    const handlePeriodeChange = (newPeriode: string) => {
        setSelectedPeriode(newPeriode);
        router.get(rapport.index().url, { periode: newPeriode }, { preserveState: true });
    };

    // Préparer les données pour les graphiques
    const chartData = ventes_par_jour.map((jour) => ({
        date: new Date(jour.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
        }),
        ventes: Number(jour.total_fc),
        nombre: jour.nombre,
    }));

    const produitsChartData = produits_vendus.slice(0, 8).map((item) => ({
        nom: item.produit.nom,
        quantite: item.quantite,
        total: Number(item.total_fc),
    }));

    const modePaiementData = ventes_par_mode_paiement?.map((item) => ({
        name: getModePaiementLabel(item.mode),
        value: Number(item.total_fc),
        nombre: item.nombre,
    })) || [];

    const heureChartData = ventes_par_heure?.map((item) => ({
        heure: item.heure,
        ventes: Number(item.total_fc),
        nombre: item.nombre,
    })) || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rapports" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Rapports</h1>
                        <p className="text-muted-foreground">
                            {new Date(date_debut).toLocaleDateString('fr-FR')} -{' '}
                            {new Date(date_fin).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePeriodeChange('jour')}
                            className={`rounded-lg px-4 py-2 transition-colors ${
                                selectedPeriode === 'jour'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            Jour
                        </button>
                        <button
                            onClick={() => handlePeriodeChange('semaine')}
                            className={`rounded-lg px-4 py-2 transition-colors ${
                                selectedPeriode === 'semaine'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            Semaine
                        </button>
                        <button
                            onClick={() => handlePeriodeChange('mois')}
                            className={`rounded-lg px-4 py-2 transition-colors ${
                                selectedPeriode === 'mois'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            Mois
                        </button>
                    </div>
                </div>

                {/* Statistiques générales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Ventes FC</div>
                                <div className="text-2xl font-bold">
                                    {statistiques.total_ventes_fc.toLocaleString('fr-CD')} FC
                                </div>
                                {statistiques.variation !== undefined && (
                                    <div
                                        className={`mt-2 flex items-center gap-1 text-sm ${
                                            statistiques.variation >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        {statistiques.variation >= 0 ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                        <span>{Math.abs(statistiques.variation).toFixed(1)}%</span>
                                        <span className="text-muted-foreground">vs période précédente</span>
                                    </div>
                                )}
                            </div>
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Ventes USD</div>
                                <div className="text-2xl font-bold">${statistiques.total_ventes_usd.toFixed(2)}</div>
                            </div>
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Nombre de ventes</div>
                                <div className="text-2xl font-bold">{statistiques.nombre_ventes}</div>
                            </div>
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Bénéfice FC</div>
                                <div className="text-2xl font-bold">
                                    {statistiques.total_benefice_fc.toLocaleString('fr-CD')} FC
                                </div>
                            </div>
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Graphiques */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Graphique des ventes par jour */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Évolution des ventes</h2>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString('fr-CD')} FC`, 'Ventes']}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} name="Ventes (FC)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    {/* Graphique des ventes par heure (si période = jour) */}
                    {periode === 'jour' && heureChartData.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold">Ventes par heure</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={heureChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="heure" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString('fr-CD')} FC`, 'Ventes']}
                                    />
                                    <Legend />
                                    <Bar dataKey="ventes" fill="#10b981" name="Ventes (FC)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Graphique des produits les plus vendus */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Produits les plus vendus</h2>
                        {produitsChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={produitsChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="nom" type="category" width={100} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString('fr-CD')} FC`, 'Total']}
                                    />
                                    <Legend />
                                    <Bar dataKey="total" fill="#3b82f6" name="Total (FC)" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    {/* Graphique des modes de paiement */}
                    {modePaiementData.length > 0 && (
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold">Répartition par mode de paiement</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={modePaiementData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {modePaiementData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString('fr-CD')} FC`, 'Montant']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Tableau des produits les plus vendus */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Détails des produits les plus vendus</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Produit</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Quantité</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Total FC</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Total USD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produits_vendus.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            Aucun produit vendu
                                        </td>
                                    </tr>
                                ) : (
                                    produits_vendus.map((item, index) => (
                                        <tr key={item.produit.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.produit.nom}</td>
                                            <td className="px-4 py-3 text-right">{item.quantite}</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {item.total_fc.toLocaleString('fr-CD')} FC
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">
                                                ${item.total_usd.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
