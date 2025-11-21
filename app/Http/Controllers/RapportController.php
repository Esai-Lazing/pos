<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\VenteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RapportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        // Vérifier l'accès aux rapports selon l'abonnement
        if ($restaurant && ! $restaurant->canAccessFeature('rapports')) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'L\'accès aux rapports n\'est pas disponible avec votre plan d\'abonnement actuel. Veuillez upgrader votre abonnement pour accéder à cette fonctionnalité.');
        }

        $periode = $request->get('periode', 'jour');
        $dateDebut = $request->get('date_debut', now()->startOfDay());
        $dateFin = $request->get('date_fin', now()->endOfDay());

        // Ajuster selon la période
        if ($periode === 'jour') {
            $dateDebut = now()->startOfDay();
            $dateFin = now()->endOfDay();
        } elseif ($periode === 'semaine') {
            $dateDebut = now()->startOfWeek();
            $dateFin = now()->endOfWeek();
        } elseif ($periode === 'mois') {
            $dateDebut = now()->startOfMonth();
            $dateFin = now()->endOfMonth();
        }

        // Filtrer par restaurant_id (sauf pour super-admin)
        $ventesQuery = Vente::with(['items.produit', 'user'])
            ->whereBetween('created_at', [$dateDebut, $dateFin]);

        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $ventesQuery->where('restaurant_id', $user->restaurant_id);
        }

        $ventes = $ventesQuery->get();

        // Statistiques générales
        $totalVentesFc = $ventes->sum('montant_total_fc');
        $totalVentesUsd = $ventes->sum('montant_total_usd');
        $nombreVentes = $ventes->count();
        $totalBeneficeFc = $ventes->sum(fn ($v) => $v->items->sum('benefice_fc'));
        $totalBeneficeUsd = $ventes->sum(fn ($v) => $v->items->sum('benefice_usd'));

        // Produits les plus vendus
        $produitsVendusQuery = VenteItem::with('produit')
            ->whereHas('vente', function ($q) use ($dateDebut, $dateFin, $user) {
                $q->whereBetween('created_at', [$dateDebut, $dateFin]);
                if (! $user->isSuperAdmin() && $user->restaurant_id) {
                    $q->where('restaurant_id', $user->restaurant_id);
                }
            });

        $produitsVendus = $produitsVendusQuery
            ->selectRaw('produit_id, sum(quantite) as total_quantite, sum(sous_total_fc) as total_fc, sum(sous_total_usd) as total_usd')
            ->groupBy('produit_id')
            ->orderByDesc('total_quantite')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'produit' => $item->produit,
                    'quantite' => $item->total_quantite,
                    'total_fc' => $item->total_fc,
                    'total_usd' => $item->total_usd,
                ];
            });

        // Ventes par jour/heure (pour graphique)
        $driver = DB::getDriverName();
        $dateFunction = $driver === 'sqlite' ? 'date(created_at)' : 'DATE(created_at)';

        $ventesParJourQuery = Vente::selectRaw("{$dateFunction} as date, sum(montant_total_fc) as total_fc, sum(montant_total_usd) as total_usd, count(*) as nombre")
            ->whereBetween('created_at', [$dateDebut, $dateFin]);

        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $ventesParJourQuery->where('restaurant_id', $user->restaurant_id);
        }

        $ventesParJour = $ventesParJourQuery
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Ventes par heure (pour le graphique journalier)
        $ventesParHeure = [];
        if ($periode === 'jour') {
            $driver = DB::getDriverName();
            $hourFunction = $driver === 'sqlite'
                ? "CAST(strftime('%H', created_at) AS INTEGER)"
                : 'HOUR(created_at)';

            $ventesParHeureQuery = Vente::selectRaw("{$hourFunction} as heure, sum(montant_total_fc) as total_fc, count(*) as nombre")
                ->whereBetween('created_at', [$dateDebut, $dateFin]);

            if (! $user->isSuperAdmin() && $user->restaurant_id) {
                $ventesParHeureQuery->where('restaurant_id', $user->restaurant_id);
            }

            $ventesParHeure = $ventesParHeureQuery
                ->groupBy('heure')
                ->orderBy('heure')
                ->get()
                ->map(function ($item) {
                    return [
                        'heure' => str_pad((string) $item->heure, 2, '0', STR_PAD_LEFT).':00',
                        'total_fc' => (float) $item->total_fc,
                        'nombre' => (int) $item->nombre,
                    ];
                });
        }

        // Comparaison avec période précédente
        $periodePrecedenteDebut = null;
        $periodePrecedenteFin = null;

        if ($periode === 'jour') {
            $periodePrecedenteDebut = now()->subDay()->startOfDay();
            $periodePrecedenteFin = now()->subDay()->endOfDay();
        } elseif ($periode === 'semaine') {
            $periodePrecedenteDebut = now()->subWeek()->startOfWeek();
            $periodePrecedenteFin = now()->subWeek()->endOfWeek();
        } elseif ($periode === 'mois') {
            $periodePrecedenteDebut = now()->subMonth()->startOfMonth();
            $periodePrecedenteFin = now()->subMonth()->endOfMonth();
        }

        $ventesPrecedentesQuery = Vente::whereBetween('created_at', [$periodePrecedenteDebut, $periodePrecedenteFin]);
        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $ventesPrecedentesQuery->where('restaurant_id', $user->restaurant_id);
        }
        $totalVentesPrecedentesFc = $ventesPrecedentesQuery->sum('montant_total_fc') ?? 0;

        // Calculer la variation en pourcentage
        if ($totalVentesPrecedentesFc > 0) {
            $variation = (($totalVentesFc - $totalVentesPrecedentesFc) / $totalVentesPrecedentesFc) * 100;
        } elseif ($totalVentesFc > 0) {
            // Si pas de ventes précédentes mais des ventes actuelles, variation = +100%
            $variation = 100;
        } else {
            // Si aucune vente dans les deux périodes, variation = 0%
            $variation = 0;
        }

        // Ventes par mode de paiement
        $ventesParModePaiementQuery = Vente::selectRaw('mode_paiement, sum(montant_total_fc) as total_fc, count(*) as nombre')
            ->whereBetween('created_at', [$dateDebut, $dateFin]);

        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $ventesParModePaiementQuery->where('restaurant_id', $user->restaurant_id);
        }

        $ventesParModePaiement = $ventesParModePaiementQuery
            ->groupBy('mode_paiement')
            ->get()
            ->map(function ($item) {
                return [
                    'mode' => $item->mode_paiement,
                    'total_fc' => (float) $item->total_fc,
                    'nombre' => (int) $item->nombre,
                ];
            });

        return Inertia::render('Rapport/Index', [
            'periode' => $periode,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'statistiques' => [
                'total_ventes_fc' => $totalVentesFc,
                'total_ventes_usd' => $totalVentesUsd,
                'nombre_ventes' => $nombreVentes,
                'total_benefice_fc' => $totalBeneficeFc,
                'total_benefice_usd' => $totalBeneficeUsd,
                'variation' => round($variation, 2),
                'total_ventes_precedentes_fc' => $totalVentesPrecedentesFc,
            ],
            'produits_vendus' => $produitsVendus,
            'ventes_par_jour' => $ventesParJour,
            'ventes_par_heure' => $ventesParHeure,
            'ventes_par_mode_paiement' => $ventesParModePaiement,
        ]);
    }
}
