<?php

namespace App\Http\Controllers;

use App\Models\Abonnement;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionManagementController extends Controller
{
    /**
     * Afficher la liste des abonnements en attente de validation
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé. Seul le super administrateur peut accéder à cette page.');
        }

        // Récupérer les abonnements en attente de validation (paiement cash)
        $pendingSubscriptions = Abonnement::with(['restaurant', 'restaurant.users'])
            ->where('mode_paiement', 'espece')
            ->where('statut_paiement', 'en_attente')
            ->latest()
            ->get()
            ->map(function ($abonnement) {
                $abonnement->montant_mensuel = (float) $abonnement->montant_mensuel;

                return $abonnement;
            });

        // Récupérer tous les abonnements pour la vue complète
        $allSubscriptions = Abonnement::with(['restaurant', 'restaurant.users'])
            ->latest()
            ->paginate(20);

        // Convertir montant_mensuel en float pour chaque abonnement
        $allSubscriptions->getCollection()->transform(function ($abonnement) {
            $abonnement->montant_mensuel = (float) $abonnement->montant_mensuel;

            return $abonnement;
        });

        return Inertia::render('Admin/Subscriptions/Index', [
            'pendingSubscriptions' => $pendingSubscriptions,
            'allSubscriptions' => $allSubscriptions,
        ]);
    }

    /**
     * Afficher les détails d'un abonnement
     */
    public function show(Request $request, Abonnement $abonnement): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé.');
        }

        $abonnement->load(['restaurant', 'restaurant.users', 'paymentTransactions', 'invoices']);

        // Convertir montant_mensuel en float
        $abonnement->montant_mensuel = (float) $abonnement->montant_mensuel;

        return Inertia::render('Admin/Subscriptions/Show', [
            'abonnement' => $abonnement,
        ]);
    }

    /**
     * Valider un paiement en espèce
     */
    public function validatePayment(Request $request, Abonnement $abonnement): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé.');
        }

        if ($abonnement->mode_paiement !== 'espece') {
            return back()->withErrors(['error' => 'Ce paiement n\'est pas un paiement en espèce.']);
        }

        DB::transaction(function () use ($abonnement) {
            $abonnement->update([
                'statut_paiement' => 'valide',
                'statut' => 'actif',
                'est_actif' => true,
                'date_paiement' => now(),
            ]);

            // Activer l'utilisateur admin du restaurant
            $adminUser = $abonnement->restaurant->users()->where('role', 'admin')->first();
            if ($adminUser) {
                $adminUser->update(['is_active' => true]);
            }

            // Activer le restaurant
            $abonnement->restaurant->update(['est_actif' => true]);
        });

        return redirect()->back()
            ->with('success', 'Paiement validé avec succès. Le compte a été activé.');
    }

    /**
     * Refuser un paiement en espèce
     */
    public function rejectPayment(Request $request, Abonnement $abonnement): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé.');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $abonnement->update([
            'statut_paiement' => 'refuse',
            'statut' => 'refuse',
            'est_actif' => false,
        ]);

        return redirect()->back()
            ->with('success', 'Paiement refusé.');
    }

    /**
     * Changer le mode de paiement d'un abonnement
     */
    public function changePaymentMethod(Request $request, Abonnement $abonnement): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Accès refusé.');
        }

        $request->validate([
            'mode_paiement' => ['required', 'string', 'in:carte_bancaire,espece'],
        ]);

        $abonnement->update([
            'mode_paiement' => $request->mode_paiement,
        ]);

        return redirect()->back()
            ->with('success', 'Mode de paiement modifié avec succès.');
    }
}
