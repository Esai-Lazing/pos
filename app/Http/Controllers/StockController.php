<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\StoreStockMovementRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Models\Produit;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Produit::query()->withCount('stockMovements');

        // Filtrer par restaurant_id (sauf pour super-admin)
        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        if ($request->boolean('stock_bas')) {
            $query->whereRaw('(quantite_casiers * bouteilles_par_casier + quantite_bouteilles) <= (stock_minimum * bouteilles_par_casier)');
        }

        $produits = $query->latest()->paginate(20);

        // Ajouter les accesseurs calculés pour chaque produit
        $produits->getCollection()->transform(function ($produit) {
            $produit->stock_total_bouteilles = $produit->stock_total_bouteilles;
            $produit->stock_bas = $produit->stock_bas;

            return $produit;
        });

        return Inertia::render('Stock/Index', [
            'produits' => $produits,
            'filters' => $request->only(['search', 'categorie', 'stock_bas']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        // Obtenir les catégories suggérées selon le type d'établissement
        $categoriesSuggerees = $restaurant
            ? \App\Services\RestaurantService::getSuggestedProductCategories($restaurant)
            : ['Produits'];

        return Inertia::render('Stock/Create', [
            'categoriesSuggerees' => $categoriesSuggerees,
        ]);
    }

    public function store(StoreProduitRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Générer automatiquement le code si non fourni
        if (empty($data['code'])) {
            $data['code'] = Produit::genererCodeUnique($data['nom']);
        }

        // Ajouter restaurant_id si l'utilisateur n'est pas super-admin
        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $data['restaurant_id'] = $user->restaurant_id;
        }

        // Appliquer des valeurs par défaut pour les prix si NULL
        $data['prix_casier_fc'] = $data['prix_casier_fc'] ?? 0;
        $data['prix_casier_usd'] = $data['prix_casier_usd'] ?? 0;
        $data['prix_bouteille_fc'] = $data['prix_bouteille_fc'] ?? 0;
        $data['prix_bouteille_usd'] = $data['prix_bouteille_usd'] ?? 0;
        $data['quantite_casiers'] = $data['quantite_casiers'] ?? 0;
        $data['quantite_bouteilles'] = $data['quantite_bouteilles'] ?? 0;
        $data['stock_minimum'] = $data['stock_minimum'] ?? 1;
        $data['est_actif'] = $data['est_actif'] ?? true;

        $produit = Produit::create($data);

        return redirect()->route('stock.index')
            ->with('success', 'Produit créé avec succès.');
    }

    public function show(Request $request, Produit $produit): Response
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a accès à ce produit
        if (! $user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à ce produit.');
        }

        $produit->load(['stockMovements.user', 'venteItems.vente']);

        return Inertia::render('Stock/Show', [
            'produit' => $produit,
        ]);
    }

    public function edit(Request $request, Produit $produit): Response
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a accès à ce produit
        if (! $user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à ce produit.');
        }

        return Inertia::render('Stock/Edit', [
            'produit' => $produit,
        ]);
    }

    public function update(UpdateProduitRequest $request, Produit $produit): RedirectResponse
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a accès à ce produit
        if (! $user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à ce produit.');
        }

        $data = $request->validated();

        // Appliquer des valeurs par défaut pour les prix si NULL (seulement si fournis)
        if (isset($data['prix_casier_fc']) && $data['prix_casier_fc'] === null) {
            $data['prix_casier_fc'] = 0;
        }
        if (isset($data['prix_casier_usd']) && $data['prix_casier_usd'] === null) {
            $data['prix_casier_usd'] = 0;
        }
        if (isset($data['prix_bouteille_fc']) && $data['prix_bouteille_fc'] === null) {
            $data['prix_bouteille_fc'] = 0;
        }
        if (isset($data['prix_bouteille_usd']) && $data['prix_bouteille_usd'] === null) {
            $data['prix_bouteille_usd'] = 0;
        }

        $produit->update($data);

        return redirect()->route('stock.index')
            ->with('success', 'Produit mis à jour avec succès.');
    }

    public function destroy(Request $request, Produit $produit): RedirectResponse
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a accès à ce produit
        if (! $user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à ce produit.');
        }

        $produit->delete();

        return redirect()->route('stock.index')
            ->with('success', 'Produit supprimé avec succès.');
    }

    public function mouvement(StoreStockMovementRequest $request): RedirectResponse
    {
        $user = $request->user();
        $produit = Produit::findOrFail($request->produit_id);

        // Vérifier que l'utilisateur a accès à ce produit
        if (! $user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à ce produit.');
        }

        $data = $request->validated();

        // S'assurer que les quantités ont des valeurs par défaut
        $data['quantite_casiers'] = $data['quantite_casiers'] ?? 0;
        $data['quantite_bouteilles'] = $data['quantite_bouteilles'] ?? 0;
        $data['quantite_verres'] = $data['quantite_verres'] ?? 0;

        // Ajouter restaurant_id au mouvement
        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $data['restaurant_id'] = $user->restaurant_id;
        }

        $movement = StockMovement::create([
            ...$data,
            'user_id' => $user->id,
        ]);

        // Mettre à jour le stock
        if ($data['type'] === 'entree') {
            if ($data['quantite_casiers'] > 0) {
                $produit->ajouterStock('casier', $data['quantite_casiers']);
            }
            if ($data['quantite_bouteilles'] > 0) {
                $produit->ajouterStock('bouteille', $data['quantite_bouteilles']);
            }
            if ($data['quantite_verres'] > 0) {
                $produit->ajouterStock('verre', $data['quantite_verres']);
            }
        } elseif ($data['type'] === 'sortie') {
            if ($data['quantite_casiers'] > 0) {
                $produit->retirerStock('casier', $data['quantite_casiers']);
            }
            if ($data['quantite_bouteilles'] > 0) {
                $produit->retirerStock('bouteille', $data['quantite_bouteilles']);
            }
            if ($data['quantite_verres'] > 0) {
                $produit->retirerStock('verre', $data['quantite_verres']);
            }
        }

        return redirect()->back()
            ->with('success', 'Mouvement de stock enregistré avec succès.');
    }
}
