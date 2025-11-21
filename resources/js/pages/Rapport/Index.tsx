import AppLayout from '@/layouts/app-layout';
import * as rapport from '@/routes/rapports';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    BarChart,
    CreditCard,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
} from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

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
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>('ventes_fc');

    const handlePeriodeChange = (newPeriode: string) => {
        setSelectedPeriode(newPeriode);
        router.get(rapport.index().url, { periode: newPeriode }, { preserveState: true });
    };

    // Configuration du graphique
    const chartConfig = {
        ventes_fc: {
            label: 'Ventes (FC)',
            color: 'var(--chart-1)',
        },
        ventes_usd: {
            label: 'Ventes (USD)',
            color: 'var(--chart-2)',
        },
        nombre: {
            label: 'Nombre de ventes',
            color: 'var(--chart-3)',
        },
    } satisfies ChartConfig;

    // Données formatées pour le graphique principal
    const chartData = useMemo(() => {
        return ventes_par_jour.map((jour) => ({
            date: jour.date,
            ventes_fc: Number(jour.total_fc),
            ventes_usd: Number(jour.total_usd),
            nombre: jour.nombre,
        }));
    }, [ventes_par_jour]);

    // Données pour le graphique par heure
    const heureChartData = useMemo(() => {
        if (!ventes_par_heure || ventes_par_heure.length === 0) return [];
        return ventes_par_heure.map((item) => ({
            heure: item.heure,
            ventes: Number(item.total_fc),
        }));
    }, [ventes_par_heure]);

    // Calcul des totaux pour l'affichage dynamique
    const totals = useMemo(() => ({
        ventes_fc: statistiques.total_ventes_fc,
        ventes_usd: statistiques.total_ventes_usd,
        nombre: statistiques.nombre_ventes,
    }), [statistiques]);

    // Calcul du panier moyen
    const panierMoyen = useMemo(() => {
        return statistiques.nombre_ventes > 0
            ? statistiques.total_ventes_fc / statistiques.nombre_ventes
            : 0;
    }, [statistiques]);

    // Données pour l'Area Chart (Modes de paiement)
    const paiementChartData = useMemo(() => {
        if (!ventes_par_mode_paiement) return [];
        return ventes_par_mode_paiement.map((item) => ({
            name: item.mode,
            value: Number(item.total_fc),
        }));
    }, [ventes_par_mode_paiement]);

    // Données pour l'Area Chart (Top 5 Produits)
    const topProduitsData = useMemo(() => {
        return produits_vendus.slice(0, 5).map((item) => ({
            nom: item.produit.nom.length > 15 ? item.produit.nom.substring(0, 15) + '...' : item.produit.nom,
            total: Number(item.total_fc),
        }));
    }, [produits_vendus]);

    // Formatage des valeurs selon le type
    const formatValue = (value: number, chart: keyof typeof chartConfig) => {
        if (chart === 'ventes_fc') return `${value.toLocaleString('fr-CD')} FC`;
        if (chart === 'ventes_usd') return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return value.toString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rapports" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-muted-foreground">
                            Aperçu des performances du {new Date(date_debut).toLocaleDateString('fr-FR')} au {new Date(date_fin).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedPeriode} onValueChange={handlePeriodeChange}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jour">Aujourd'hui</SelectItem>
                                <SelectItem value="semaine">Cette semaine</SelectItem>
                                <SelectItem value="mois">Ce mois</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grille principale du tableau de bord */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">

                    {/* KPI 1: Ventes FC */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20 col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventes Totales (FC)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistiques.total_ventes_fc.toLocaleString('fr-CD')} FC</div>
                            {statistiques.variation !== undefined && (
                                <div className={`flex items-center text-xs ${statistiques.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {statistiques.variation >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                                    {Math.abs(statistiques.variation).toFixed(1)}% vs préc.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* KPI 2: Ventes USD */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20 col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventes Totales (USD)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${statistiques.total_ventes_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Revenu en devises</p>
                        </CardContent>
                    </Card>

                    {/* KPI 3: Transactions */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20 col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistiques.nombre_ventes}</div>
                            <p className="text-xs text-muted-foreground">Nombre total de ventes</p>
                        </CardContent>
                    </Card>

                    {/* KPI 4: Panier Moyen */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20 col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{panierMoyen.toLocaleString('fr-CD')} FC</div>
                            <p className="text-xs text-muted-foreground">Moyenne par transaction</p>
                        </CardContent>
                    </Card>

                    {/* KPI 5: Bénéfice Estimé - Prend 2 colonnes sur mobile/tablette pour équilibrer, 1 sur desktop ou s'aligne */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20 col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bénéfice Estimé (FC)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{statistiques.total_benefice_fc.toLocaleString('fr-CD')} FC</div>
                            <p className="text-xs text-muted-foreground">Marge brute estimée</p>
                        </CardContent>
                    </Card>

                    {/* Graphique Principal - Evolution */}
                    {/* MD: Full width (3 cols), LG: 3 cols (next to KPI 5? No, new row usually better but let's try layout flow) */}
                    {/* Let's make it span full width on MD, and 3 cols on LG to sit next to something? Or full width.
                        Given the requested grid, let's make it prominent. col-span-full is safest for Main Chart.
                    */}
                    <Card className="shadow-md col-span-full lg:col-span-3 lg:row-span-2">
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Évolution de l'activité</CardTitle>
                                <CardDescription>
                                    Aperçu détaillé des {chartConfig[activeChart].label.toLowerCase()}
                                </CardDescription>
                            </div>
                            <Select value={activeChart} onValueChange={(val) => setActiveChart(val as keyof typeof chartConfig)}>
                                <SelectTrigger className="w-[180px] rounded-lg sm:ml-auto" aria-label="Choisir une métrique">
                                    <SelectValue placeholder="Métrique" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="ventes_fc" className="rounded-lg">Ventes (FC)</SelectItem>
                                    <SelectItem value="ventes_usd" className="rounded-lg">Ventes (USD)</SelectItem>
                                    <SelectItem value="nombre" className="rounded-lg">Nombre de ventes</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            {chartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                    <AreaChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString('fr-FR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                });
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    indicator="line"
                                                    labelFormatter={(value) => {
                                                        return new Date(value).toLocaleDateString('fr-FR', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        });
                                                    }}
                                                />
                                            }
                                        />
                                        <Area
                                            dataKey={activeChart}
                                            type="natural"
                                            fill={chartConfig[activeChart].color}
                                            fillOpacity={0.4}
                                            stroke={chartConfig[activeChart].color}
                                            stackId="a"
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                                    Aucune donnée disponible pour cette période
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Répartition par mode de paiement */}
                    {/* MD: 1 col, LG: 1 col. Sits next to Main Chart on LG? */}
                    <Card className="shadow-md col-span-1 md:col-span-1 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Paiements</CardTitle>
                            <CardDescription>Répartition</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    fc: { label: 'Franc Congolais', color: 'var(--chart-1)' },
                                    usd: { label: 'Dollar US', color: 'var(--chart-2)' },
                                    mixte: { label: 'Mixte', color: 'var(--chart-3)' },
                                }}
                                className="h-[300px] w-full"
                            >
                                <AreaChart
                                    accessibilityLayer
                                    data={paiementChartData}
                                    margin={{ left: 12, right: 12 }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Area
                                        dataKey="value"
                                        type="natural"
                                        fill="var(--chart-1)"
                                        fillOpacity={0.4}
                                        stroke="var(--chart-1)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Top 5 Produits */}
                    {/* MD: 2 cols, LG: 2 cols. */}
                    <Card className="shadow-md col-span-1 md:col-span-2 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Top 5 Produits</CardTitle>
                            <CardDescription>Tendances des meilleures ventes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    total: { label: 'Ventes (FC)', color: 'var(--chart-2)' }
                                }}
                                className="h-[300px] w-full"
                            >
                                <AreaChart
                                    accessibilityLayer
                                    data={topProduitsData}
                                    margin={{ left: 12, right: 12 }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="nom"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.substring(0, 10) + (value.length > 10 ? '...' : '')}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Area
                                        dataKey="total"
                                        type="natural"
                                        fill="var(--chart-2)"
                                        fillOpacity={0.4}
                                        stroke="var(--chart-2)"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Graphiques secondaires (Heure) si disponible */}
                    {periode === 'jour' && heureChartData.length > 0 && (
                        <Card className="shadow-md col-span-full md:col-span-3 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Distribution horaire</CardTitle>
                                <CardDescription>Activité par heure de la journée</CardDescription>
                            </CardHeader>
                            <CardContent className="px-2 sm:px-6">
                                <ChartContainer
                                    config={{
                                        ventes: { label: 'Ventes (FC)', color: 'var(--chart-4)' }
                                    }}
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <AreaChart data={heureChartData} margin={{ left: 12, right: 12 }}>
                                        <defs>
                                            <linearGradient id="fillHeure" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="heure"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="line" />}
                                        />
                                        <Area
                                            dataKey="ventes"
                                            type="step"
                                            fill="url(#fillHeure)"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tableau des produits */}
                    <Card className="shadow-md col-span-full">
                        <CardHeader>
                            <CardTitle>Détails des produits</CardTitle>
                            <CardDescription>Liste complète des performances produits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rang</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produit</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Quantité</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">CA (FC)</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">CA (USD)</th>
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
                                            produits_vendus.slice(0, 10).map((item, index) => (
                                                <tr key={item.produit.id} className="group border-b border-border last:border-0 hover:bg-muted/30">
                                                    <td className="px-4 py-3 font-medium text-muted-foreground">#{index + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-foreground">{item.produit.nom}</td>
                                                    <td className="px-4 py-3 text-right">{item.quantite}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-primary">
                                                        {item.total_fc.toLocaleString('fr-CD')} FC
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        ${item.total_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
