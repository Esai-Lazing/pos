<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRestaurantRequest;
use App\Models\Abonnement;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function index(Request $request): Response
    {
        $showDeleted = $request->boolean('deleted', false);

        $query = Restaurant::with(['abonnement', 'customization']);

        if ($showDeleted) {
            $query->onlyTrashed();
        }

        $restaurants = $query->latest()->paginate(20);

        // Préserver le paramètre deleted dans les liens de pagination
        $restaurants->appends($request->only('deleted'));

        return Inertia::render('Restaurant/Index', [
            'restaurants' => $restaurants,
            'showDeleted' => $showDeleted,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Restaurant/Create');
    }

    public function store(StoreRestaurantRequest $request): RedirectResponse
    {
        // Générer un slug unique avant la création
        // Cette méthode vérifie l'unicité en incluant les enregistrements supprimés
        $slug = Restaurant::genererSlugUnique($request->nom);

        try {
            $restaurant = Restaurant::create([
                'nom' => $request->nom,
                'slug' => $slug,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'est_actif' => true,
                'date_creation' => now(),
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Si l'erreur est liée à la contrainte unique du slug, régénérer le slug
            if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'slug')) {
                // Forcer la régénération du slug en incluant tous les enregistrements
                $slug = Restaurant::assurerSlugUnique($slug);
                $restaurant = Restaurant::create([
                    'nom' => $request->nom,
                    'slug' => $slug,
                    'email' => $request->email,
                    'telephone' => $request->telephone,
                    'est_actif' => true,
                    'date_creation' => now(),
                ]);
            } else {
                throw $e;
            }
        }

        Abonnement::create([
            'restaurant_id' => $restaurant->id,
            'plan' => $request->plan,
            'montant_mensuel' => $request->montant_mensuel,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'est_actif' => true,
            'statut' => 'actif',
        ]);

        // Générer un mot de passe temporaire sécurisé mais lisible
        // Format: 2 majuscules + 4 chiffres + 2 minuscules + 4 chiffres (ex: AB1234cd5678)
        $uppercase = strtoupper(Str::random(2));
        $numbers1 = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $lowercase = strtolower(Str::random(2));
        $numbers2 = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $password = $uppercase.$numbers1.$lowercase.$numbers2;
        
        // Créer un utilisateur admin pour le restaurant
        $admin = User::create([
            'name' => 'Administrateur '.$restaurant->nom,
            'email' => $request->email, // Utiliser l'email du restaurant comme identifiant admin
            'password' => Hash::make($password),
            'role' => 'admin',
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Stocker les identifiants dans la session pour les afficher
        return redirect()->route('restaurant.show', $restaurant)
            ->with('success', 'Restaurant créé avec succès.')
            ->with('admin_credentials', [
                'email' => $admin->email,
                'password' => $password,
                'name' => $admin->name,
            ]);
    }

    public function show(Request $request, Restaurant $restaurant): Response
    {
        // Si le restaurant est supprimé, utiliser onlyTrashed pour le charger
        if ($restaurant->trashed()) {
            $restaurant = Restaurant::onlyTrashed()->findOrFail($restaurant->id);
        }

        $restaurant->load(['abonnement', 'customization', 'users']);

        return Inertia::render('Restaurant/Show', [
            'restaurant' => $restaurant,
        ]);
    }

    public function suspend(Restaurant $restaurant): RedirectResponse
    {
        $restaurant->update([
            'est_actif' => false,
        ]);

        // Suspendre aussi l'abonnement actif
        $abonnement = $restaurant->abonnement;
        if ($abonnement) {
            $abonnement->update([
                'statut' => 'suspendu',
                'est_actif' => false,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Restaurant suspendu avec succès.');
    }

    public function activate(Restaurant $restaurant): RedirectResponse
    {
        $restaurant->update([
            'est_actif' => true,
        ]);

        // Réactiver l'abonnement si disponible
        $abonnement = $restaurant->abonnements()->latest()->first();
        if ($abonnement) {
            $abonnement->update([
                'statut' => 'actif',
                'est_actif' => true,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Restaurant activé avec succès.');
    }

    public function destroy(Restaurant $restaurant): RedirectResponse
    {
        $restaurant->delete();

        return redirect()->route('restaurant.index')
            ->with('success', 'Restaurant supprimé avec succès.');
    }

    /**
     * Restaurer un restaurant supprimé
     */
    public function restore(int $id): RedirectResponse
    {
        $restaurant = Restaurant::onlyTrashed()->findOrFail($id);
        $restaurant->restore();

        // Rediriger vers la liste des restaurants actifs après restauration
        return redirect()->route('restaurant.index', ['deleted' => false])
            ->with('success', 'Restaurant restauré avec succès.');
    }

    /**
     * Supprimer définitivement un restaurant
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $restaurant = Restaurant::onlyTrashed()->findOrFail($id);
        $restaurant->forceDelete();

        return redirect()->route('restaurant.index', ['deleted' => true])
            ->with('success', 'Restaurant supprimé définitivement.');
    }
}
