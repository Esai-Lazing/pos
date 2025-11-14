<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVenteRequest;
use App\Http\Requests\UpdateVenteRequest;
use App\Models\Printer;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VenteController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $periode = $request->get('periode', 'jour');
        $dateDebut = now()->startOfDay();
        $dateFin = now()->endOfDay();

        // Ajuster selon la période
        match ($periode) {
            'jour' => [
                $dateDebut = now()->startOfDay(),
                $dateFin = now()->endOfDay(),
            ],
            'semaine' => [
                $dateDebut = now()->startOfWeek(),
                $dateFin = now()->endOfWeek(),
            ],
            'mois' => [
                $dateDebut = now()->startOfMonth(),
                $dateFin = now()->endOfMonth(),
            ],
            default => null,
        };

        $query = Vente::with(['user', 'items.produit'])
            ->whereBetween('created_at', [$dateDebut, $dateFin]);

        // Filtrer par restaurant_id (sauf pour super-admin)
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $ventes = $query->latest()->paginate(20);

        // Calculer les statistiques avec le même filtre
        $statsQuery = Vente::whereBetween('created_at', [$dateDebut, $dateFin]);
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $statsQuery->where('restaurant_id', $user->restaurant_id);
        }

        $totalVentesFc = $statsQuery->sum('montant_total_fc');
        $totalVentesUsd = $statsQuery->sum('montant_total_usd');
        $nombreVentes = $statsQuery->count();

        return Inertia::render('Vente/Index', [
            'ventes' => $ventes,
            'periode' => $periode,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'statistiques' => [
                'total_ventes_fc' => $totalVentesFc,
                'total_ventes_usd' => $totalVentesUsd,
                'nombre_ventes' => $nombreVentes,
            ],
            'filters' => $request->only(['periode', 'user_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $query = Produit::where('est_actif', true);

        // Filtrer par restaurant_id (sauf pour super-admin)
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        $produits = $query->orderBy('nom')->get();

        $printer = Printer::getParDefaut($user->restaurant_id);

        return Inertia::render('Vente/Create', [
            'produits' => $produits,
            'printer' => $printer,
        ]);
    }

    public function store(StoreVenteRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'];

        // Calculer les totaux
        $montantTotalFc = 0;
        $montantTotalUsd = 0;

        foreach ($items as $item) {
            $montantTotalFc += $item['quantite'] * $item['prix_unitaire_fc'];
            $montantTotalUsd += $item['quantite'] * ($item['prix_unitaire_usd'] ?? 0);
        }

        $montantPayeFc = $data['montant_paye_fc'] ?? 0;
        $montantPayeUsd = $data['montant_paye_usd'] ?? 0;

        $renduFc = max(0, $montantPayeFc - $montantTotalFc);
        $renduUsd = max(0, $montantPayeUsd - $montantTotalUsd);

        $user = $request->user();

        // Créer la vente
        $venteData = [
            'user_id' => $user->id,
            'montant_total_fc' => $montantTotalFc,
            'montant_total_usd' => $montantTotalUsd,
            'montant_paye_fc' => $montantPayeFc,
            'montant_paye_usd' => $montantPayeUsd,
            'rendu_fc' => $renduFc,
            'rendu_usd' => $renduUsd,
            'mode_paiement' => $data['mode_paiement'],
            'taux_change' => $data['taux_change'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];

        // Ajouter restaurant_id si l'utilisateur n'est pas super-admin
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $venteData['restaurant_id'] = $user->restaurant_id;
        }

        $vente = Vente::create($venteData);

        // Créer les items de vente et mettre à jour le stock
        foreach ($items as $item) {
            $produit = Produit::findOrFail($item['produit_id']);

            // Vérifier que le produit appartient au restaurant de l'utilisateur
            if (!$user->isSuperAdmin() && $produit->restaurant_id !== $user->restaurant_id) {
                $vente->delete();
                return redirect()->back()
                    ->with('error', 'Produit non autorisé pour votre restaurant.');
            }

            // Retirer du stock
            if (! $produit->retirerStock($item['unite'], $item['quantite'])) {
                $vente->delete();

                return redirect()->back()
                    ->with('error', 'Stock insuffisant pour '.$produit->nom.'. Vente annulée.');
            }

            // Calculer le bénéfice (simplifié - à améliorer avec prix d'achat)
            $beneficeFc = 0;
            $beneficeUsd = 0;

            $vente->items()->create([
                'produit_id' => $item['produit_id'],
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire_fc' => $item['prix_unitaire_fc'],
                'prix_unitaire_usd' => $item['prix_unitaire_usd'] ?? 0,
                'sous_total_fc' => $item['quantite'] * $item['prix_unitaire_fc'],
                'sous_total_usd' => $item['quantite'] * ($item['prix_unitaire_usd'] ?? 0),
                'benefice_fc' => $beneficeFc,
                'benefice_usd' => $beneficeUsd,
            ]);
        }

        // Rediriger selon le rôle de l'utilisateur
        if ($user->isServeur()) {
            return redirect()->route('serveur.vente.show', $vente)
                ->with('success', 'Vente enregistrée avec succès.');
        }

        return redirect()->route('vente.show', $vente)
            ->with('success', 'Vente enregistrée avec succès.');
    }

    public function show(Request $request, Vente $vente): Response
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette vente
        if (!$user->isSuperAdmin() && $vente->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette vente.');
        }

        $vente->load(['user', 'items.produit', 'restaurant']);
        $printer = Printer::getParDefaut($user->restaurant_id);
        
        // Charger les données de personnalisation du restaurant
        $customization = null;
        if ($vente->restaurant_id) {
            $customization = \App\Models\RestaurantCustomization::where('restaurant_id', $vente->restaurant_id)->first();
        }

        return Inertia::render('Vente/Show', [
            'vente' => $vente,
            'printer' => $printer,
            'customization' => $customization,
        ]);
    }

    public function edit(Request $request, Vente $vente): Response
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette vente
        if (!$user->isSuperAdmin() && $vente->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette vente.');
        }

        $vente->load(['items.produit']);
        
        $produitsQuery = Produit::where('est_actif', true);
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $produitsQuery->where('restaurant_id', $user->restaurant_id);
        }
        $produits = $produitsQuery->orderBy('nom')->get();

        $printer = Printer::getParDefaut($user->restaurant_id);

        return Inertia::render('Vente/Edit', [
            'vente' => $vente,
            'produits' => $produits,
            'printer' => $printer,
        ]);
    }

    public function update(UpdateVenteRequest $request, Vente $vente): RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette vente
        if (!$user->isSuperAdmin() && $vente->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette vente.');
        }

        $data = $request->validated();
        $items = $data['items'];

        // Restaurer le stock des anciens items
        foreach ($vente->items as $oldItem) {
            $produit = Produit::find($oldItem->produit_id);
            if ($produit) {
                $produit->ajouterStock($oldItem->unite, $oldItem->quantite);
            }
        }

        // Calculer les nouveaux totaux
        $montantTotalFc = 0;
        $montantTotalUsd = 0;

        foreach ($items as $item) {
            $montantTotalFc += $item['quantite'] * $item['prix_unitaire_fc'];
            $montantTotalUsd += $item['quantite'] * ($item['prix_unitaire_usd'] ?? 0);
        }

        $montantPayeFc = $data['montant_paye_fc'] ?? 0;
        $montantPayeUsd = $data['montant_paye_usd'] ?? 0;

        $renduFc = max(0, $montantPayeFc - $montantTotalFc);
        $renduUsd = max(0, $montantPayeUsd - $montantTotalUsd);

        // Mettre à jour la vente
        $vente->update([
            'montant_total_fc' => $montantTotalFc,
            'montant_total_usd' => $montantTotalUsd,
            'montant_paye_fc' => $montantPayeFc,
            'montant_paye_usd' => $montantPayeUsd,
            'rendu_fc' => $renduFc,
            'rendu_usd' => $renduUsd,
            'mode_paiement' => $data['mode_paiement'],
            'taux_change' => $data['taux_change'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        // Sauvegarder les anciens items pour restauration en cas d'erreur
        $oldItems = $vente->items->toArray();

        // Supprimer les anciens items
        $vente->items()->delete();

        // Créer les nouveaux items et mettre à jour le stock
        $newItemsCreated = [];
        foreach ($items as $item) {
            $produit = Produit::findOrFail($item['produit_id']);

            // Retirer du stock
            if (! $produit->retirerStock($item['unite'], $item['quantite'])) {
                // Restaurer le stock déjà retiré en cas d'erreur
                foreach ($newItemsCreated as $restoredItem) {
                    $restoredProduit = Produit::find($restoredItem['produit_id']);
                    if ($restoredProduit) {
                        $restoredProduit->ajouterStock($restoredItem['unite'], $restoredItem['quantite']);
                    }
                }
                // Restaurer les anciens items
                foreach ($oldItems as $oldItem) {
                    $oldProduit = Produit::find($oldItem['produit_id']);
                    if ($oldProduit) {
                        $oldProduit->retirerStock($oldItem['unite'], $oldItem['quantite']);
                    }
                }

                return redirect()->back()
                    ->with('error', 'Stock insuffisant pour '.$produit->nom.'. Modification annulée.');
            }

            // Calculer le bénéfice (simplifié - à améliorer avec prix d'achat)
            $beneficeFc = 0;
            $beneficeUsd = 0;

            $vente->items()->create([
                'produit_id' => $item['produit_id'],
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire_fc' => $item['prix_unitaire_fc'],
                'prix_unitaire_usd' => $item['prix_unitaire_usd'] ?? 0,
                'sous_total_fc' => $item['quantite'] * $item['prix_unitaire_fc'],
                'sous_total_usd' => $item['quantite'] * ($item['prix_unitaire_usd'] ?? 0),
                'benefice_fc' => $beneficeFc,
                'benefice_usd' => $beneficeUsd,
            ]);

            $newItemsCreated[] = $item;
        }

        return redirect()->route('vente.show', $vente)
            ->with('success', 'Vente modifiée avec succès.');
    }

    public function imprimer(Vente $vente): RedirectResponse
    {
        $vente->marquerCommeImprime();

        return redirect()->back()
            ->with('success', 'Facture marquée comme imprimée.');
    }

    public function printReceipt(Vente $vente, Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette vente
        if (!$user->isSuperAdmin() && $vente->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette vente.');
        }

        $vente->load(['items.produit', 'restaurant']);
        $printer = Printer::getParDefaut($user->restaurant_id);
        
        // Charger les données de personnalisation du restaurant
        $customization = null;
        if ($vente->restaurant_id) {
            $customization = \App\Models\RestaurantCustomization::where('restaurant_id', $vente->restaurant_id)->first();
        }

        // Marquer comme imprimé
        $vente->marquerCommeImprime();

        // Retourner les données de la facture formatée pour l'impression
        return response()->json([
            'receipt' => $this->formatReceipt($vente, $printer, $customization),
            'vente' => $vente,
            'printer' => $printer,
            'customization' => $customization,
        ]);
    }

    private function formatReceipt(Vente $vente, ?Printer $printer, ?\App\Models\RestaurantCustomization $customization = null): string
    {
        $lines = [];
        $width = $printer?->largeur_papier ?? 80;

        // En-tête - Utiliser les données de personnalisation si disponibles, sinon l'imprimante
        $nomRestaurant = $customization?->restaurant?->nom ?? $printer?->nom_restaurant ?? 'Restaurant';
        $adresseRestaurant = $customization?->adresse ?? $printer?->adresse_restaurant ?? null;
        $villeRestaurant = $customization?->ville ?? null;
        $paysRestaurant = $customization?->pays ?? null;
        $codePostalRestaurant = $customization?->code_postal ?? null;
        $telephoneRestaurant = $customization?->restaurant?->telephone ?? $printer?->telephone_restaurant ?? null;
        $siteWeb = $customization?->site_web ?? null;
        
        $lines[] = str_pad($nomRestaurant, $width, ' ', STR_PAD_BOTH);
        
        // Construire l'adresse complète
        if ($adresseRestaurant) {
            $adresseComplete = $adresseRestaurant;
            if ($codePostalRestaurant) {
                $adresseComplete .= ', '.$codePostalRestaurant;
            }
            if ($villeRestaurant) {
                $adresseComplete .= ' '.$villeRestaurant;
            }
            if ($paysRestaurant) {
                $adresseComplete .= ', '.$paysRestaurant;
            }
            $lines[] = str_pad($adresseComplete, $width, ' ', STR_PAD_BOTH);
        }
        
        if ($telephoneRestaurant) {
            $lines[] = str_pad('Tél: '.$telephoneRestaurant, $width, ' ', STR_PAD_BOTH);
        }
        
        if ($siteWeb) {
            $lines[] = str_pad($siteWeb, $width, ' ', STR_PAD_BOTH);
        }
        
        $lines[] = str_repeat('=', $width);
        $lines[] = '';

        // Informations de la facture
        $lines[] = 'Facture: '.$vente->numero_facture;
        $lines[] = 'Date: '.$vente->created_at->format('d/m/Y H:i');
        $lines[] = '';

        // Articles
        $lines[] = str_repeat('-', $width);
        $lines[] = str_pad('Article', 30).str_pad('Qté', 10, ' ', STR_PAD_LEFT)
            .str_pad('Prix', 20, ' ', STR_PAD_LEFT).str_pad('Total', 20, ' ', STR_PAD_LEFT);
        $lines[] = str_repeat('-', $width);

        $modePaiement = $vente->mode_paiement ?? 'fc';
        $afficherFC = $modePaiement === 'fc' || $modePaiement === 'mixte';
        $afficherUSD = $modePaiement === 'usd' || $modePaiement === 'mixte';

        foreach ($vente->items as $item) {
            $nom = $item->produit?->nom ?? 'Produit';
            $nom = mb_substr($nom, 0, 28);
            $ligne = str_pad($nom, 30);

            if ($afficherFC) {
                $ligne .= str_pad($item->quantite.'', 10, ' ', STR_PAD_LEFT);
                $ligne .= str_pad(number_format($item->prix_unitaire_fc, 0, ',', ' ').' FC', 20, ' ', STR_PAD_LEFT);
                $ligne .= str_pad(number_format($item->prix_unitaire_fc * $item->quantite, 0, ',', ' ').' FC', 20, ' ', STR_PAD_LEFT);
            }

            if ($afficherUSD && $item->prix_unitaire_usd > 0) {
                if ($afficherFC) {
                    $ligne .= ' / ';
                }
                $ligne .= '$'.number_format($item->prix_unitaire_usd, 2);
            }

            $lines[] = $ligne;
        }

        $lines[] = str_repeat('-', $width);
        $lines[] = '';

        // Totaux
        if ($afficherFC) {
            $lines[] = str_pad('Total FC:', 50).str_pad(number_format($vente->montant_total_fc, 0, ',', ' ').' FC', 30, ' ', STR_PAD_LEFT);
        }
        if ($afficherUSD && $vente->montant_total_usd > 0) {
            $lines[] = str_pad('Total USD:', 50).str_pad('$'.number_format($vente->montant_total_usd, 2), 30, ' ', STR_PAD_LEFT);
        }
        $lines[] = '';

        // Paiement
        if ($afficherFC) {
            $lines[] = str_pad('Payé FC:', 50).str_pad(number_format($vente->montant_paye_fc, 0, ',', ' ').' FC', 30, ' ', STR_PAD_LEFT);
        }
        if ($afficherUSD && $vente->montant_paye_usd > 0) {
            $lines[] = str_pad('Payé USD:', 50).str_pad('$'.number_format($vente->montant_paye_usd, 2), 30, ' ', STR_PAD_LEFT);
        }

        // Reste à payer
        $resteFc = $vente->montant_total_fc - $vente->montant_paye_fc;
        if ($afficherFC && $resteFc > 0) {
            $lines[] = str_pad('Reste à payer FC:', 50).str_pad(number_format($resteFc, 0, ',', ' ').' FC', 30, ' ', STR_PAD_LEFT);
        }
        $resteUsd = $vente->montant_total_usd - ($vente->montant_paye_usd ?? 0);
        if ($afficherUSD && $resteUsd > 0) {
            $lines[] = str_pad('Reste à payer USD:', 50).str_pad('$'.number_format($resteUsd, 2), 30, ' ', STR_PAD_LEFT);
        }

        // Rendu
        if ($afficherFC && $vente->rendu_fc > 0) {
            $lines[] = str_pad('Rendu FC:', 50).str_pad(number_format($vente->rendu_fc, 0, ',', ' ').' FC', 30, ' ', STR_PAD_LEFT);
        }
        if ($afficherUSD && $vente->rendu_usd > 0) {
            $lines[] = str_pad('Rendu USD:', 50).str_pad('$'.number_format($vente->rendu_usd, 2), 30, ' ', STR_PAD_LEFT);
        }
        $lines[] = '';

        // Message personnalisé
        if ($printer?->message_facture) {
            $lines[] = str_pad($printer->message_facture, $width, ' ', STR_PAD_BOTH);
        } else {
            $lines[] = str_pad('Merci de votre visite !', $width, ' ', STR_PAD_BOTH);
        }
        $lines[] = '';

        return implode("\n", $lines);
    }
}
