<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\StockMovement;
use App\Models\Vente;
use App\Models\VenteItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user->role ?? 'caisse';

        $dateDebut = now()->startOfDay();
        $dateFin = now()->endOfDay();

        $data = [];

        // Données communes à tous les rôles
        $data['role'] = $role;

        // Filtrer par restaurant_id (sauf pour super-admin)
        $restaurantFilter = function ($query) use ($user) {
            if (!$user->isSuperAdmin() && $user->restaurant_id) {
                $query->where('restaurant_id', $user->restaurant_id);
            }
        };

        // Dashboard Admin : Vue complète
        if ($role === 'admin') {
            // Statistiques générales du jour
            $ventesAujourdhuiQuery = Vente::whereBetween('created_at', [$dateDebut, $dateFin]);
            $restaurantFilter($ventesAujourdhuiQuery);
            $ventesAujourdhui = $ventesAujourdhuiQuery->get();
            $totalVentesFc = $ventesAujourdhui->sum('montant_total_fc');
            $totalVentesUsd = $ventesAujourdhui->sum('montant_total_usd');
            $nombreVentes = $ventesAujourdhui->count();

            // Statistiques de la semaine
            $dateDebutSemaine = now()->startOfWeek();
            $ventesSemaineQuery = Vente::whereBetween('created_at', [$dateDebutSemaine, $dateFin]);
            $restaurantFilter($ventesSemaineQuery);
            $ventesSemaine = $ventesSemaineQuery->get();
            $totalVentesSemaineFc = $ventesSemaine->sum('montant_total_fc');
            $totalVentesSemaineUsd = $ventesSemaine->sum('montant_total_usd');

            // Statistiques du mois
            $dateDebutMois = now()->startOfMonth();
            $ventesMoisQuery = Vente::whereBetween('created_at', [$dateDebutMois, $dateFin]);
            $restaurantFilter($ventesMoisQuery);
            $ventesMois = $ventesMoisQuery->get();
            $totalVentesMoisFc = $ventesMois->sum('montant_total_fc');
            $totalVentesMoisUsd = $ventesMois->sum('montant_total_usd');

            // Stock
            $produitsQuery = Produit::query();
            $restaurantFilter($produitsQuery);
            $totalProduits = $produitsQuery->count();
            
            $produitsStockBasQuery = Produit::whereRaw('(quantite_casiers * bouteilles_par_casier + quantite_bouteilles) <= (stock_minimum * bouteilles_par_casier)')
                ->where('est_actif', true);
            $restaurantFilter($produitsStockBasQuery);
            $produitsStockBas = $produitsStockBasQuery->count();

            // Produits les plus vendus aujourd'hui
            $produitsVendusQuery = VenteItem::with('produit')
                ->whereHas('vente', function ($q) use ($dateDebut, $dateFin, $user, $restaurantFilter) {
                    $q->whereBetween('created_at', [$dateDebut, $dateFin]);
                    $restaurantFilter($q);
                });
            $produitsVendus = $produitsVendusQuery
                ->selectRaw('produit_id, sum(quantite) as total_quantite, sum(sous_total_fc) as total_fc')
                ->groupBy('produit_id')
                ->orderByDesc('total_quantite')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'produit' => $item->produit?->nom ?? 'Produit supprimé',
                        'quantite' => $item->total_quantite,
                        'total_fc' => $item->total_fc,
                    ];
                });

            // Dernières ventes
            $dernieresVentesQuery = Vente::with(['user', 'items.produit']);
            $restaurantFilter($dernieresVentesQuery);
            $dernieresVentes = $dernieresVentesQuery->latest()->limit(5)->get();

            $data['statistiques'] = [
                'ventes_aujourdhui' => [
                    'total_fc' => $totalVentesFc,
                    'total_usd' => $totalVentesUsd,
                    'nombre' => $nombreVentes,
                ],
                'ventes_semaine' => [
                    'total_fc' => $totalVentesSemaineFc,
                    'total_usd' => $totalVentesSemaineUsd,
                ],
                'ventes_mois' => [
                    'total_fc' => $totalVentesMoisFc,
                    'total_usd' => $totalVentesMoisUsd,
                ],
                'stock' => [
                    'total_produits' => $totalProduits,
                    'produits_stock_bas' => $produitsStockBas,
                ],
            ];
            $data['produits_vendus'] = $produitsVendus;
            $data['dernieres_ventes'] = $dernieresVentes;
        }

        // Dashboard Caisse : Focus sur les ventes
        if ($role === 'caisse') {
            // Ventes du jour par l'utilisateur
            $ventesUtilisateur = Vente::where('user_id', $user->id)
                ->whereBetween('created_at', [$dateDebut, $dateFin])
                ->get();

            $totalVentesFc = $ventesUtilisateur->sum('montant_total_fc');
            $totalVentesUsd = $ventesUtilisateur->sum('montant_total_usd');
            $nombreVentes = $ventesUtilisateur->count();

            // Dernières ventes de l'utilisateur
            $dernieresVentes = Vente::with(['items.produit'])
                ->where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get();

            $data['statistiques'] = [
                'ventes_aujourdhui' => [
                    'total_fc' => $totalVentesFc,
                    'total_usd' => $totalVentesUsd,
                    'nombre' => $nombreVentes,
                ],
            ];
            $data['dernieres_ventes'] = $dernieresVentes;
        }

        // Dashboard Stock : Focus sur le stock
        if ($role === 'stock') {
            // Produits avec stock bas
            $produitsStockBasQuery = Produit::whereRaw('(quantite_casiers * bouteilles_par_casier + quantite_bouteilles) <= (stock_minimum * bouteilles_par_casier)')
                ->where('est_actif', true);
            $restaurantFilter($produitsStockBasQuery);
            $produitsStockBas = $produitsStockBasQuery->orderBy('nom')->limit(10)->get();

            // Total produits
            $totalProduitsQuery = Produit::where('est_actif', true);
            $restaurantFilter($totalProduitsQuery);
            $totalProduits = $totalProduitsQuery->count();
            $totalProduitsStockBas = $produitsStockBas->count();

            // Mouvements récents (7 derniers jours)
            $dateDebutSemaine = now()->subDays(7);
            $mouvementsRecentsQuery = StockMovement::with(['produit', 'user'])
                ->where('date_mouvement', '>=', $dateDebutSemaine);
            $restaurantFilter($mouvementsRecentsQuery);
            $mouvementsRecents = $mouvementsRecentsQuery->latest('date_mouvement')->limit(10)->get();

            $data['statistiques'] = [
                'stock' => [
                    'total_produits' => $totalProduits,
                    'produits_stock_bas' => $totalProduitsStockBas,
                ],
            ];
            $data['produits_stock_bas'] = $produitsStockBas;
            $data['mouvements_recents'] = $mouvementsRecents;
        }

        return Inertia::render('dashboard', $data);
    }
}
