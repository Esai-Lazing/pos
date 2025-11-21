<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserPasswordRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Afficher la liste des utilisateurs (Admin uniquement)
     * Les admins ne voient que les utilisateurs de leur restaurant (sauf super-admin)
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        // Exclure les super-admins de la liste
        $query = User::query()->where('role', '!=', 'super-admin');

        // Si l'utilisateur est un admin (pas super-admin), filtrer par restaurant
        if (! $user->isSuperAdmin() && $user->restaurant_id) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $role = $request->role;
            // Ne pas permettre de filtrer par super-admin
            if ($role !== 'super-admin') {
                $query->where('role', $role);
            }
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->latest()->paginate(20);

        // Calculer les statistiques d'utilisateurs et serveurs
        $userStats = [
            'total_users' => 0,
            'total_serveurs' => 0,
            'max_users' => null,
            'max_serveurs' => null,
        ];

        if ($restaurant) {
            $limitations = $restaurant->getLimitations();
            $userStats['max_users'] = $limitations['max_users'] ?? null;
            $userStats['max_serveurs'] = $limitations['max_serveurs'] ?? null;

            // Compter les utilisateurs non-serveurs
            $userStats['total_users'] = $restaurant->users()
                ->where('role', '!=', 'serveur')
                ->where('role', '!=', 'super-admin')
                ->count();

            // Compter les serveurs
            $userStats['total_serveurs'] = $restaurant->users()
                ->where('role', 'serveur')
                ->count();
        }

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active']),
            'userStats' => $userStats,
        ]);
    }

    /**
     * Afficher le formulaire de création d'un utilisateur (Admin uniquement)
     */
    public function create(): Response
    {
        return Inertia::render('User/Create');
    }

    /**
     * Créer un nouvel utilisateur (Admin uniquement)
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $currentUser = $request->user();
        $restaurant = $currentUser->restaurant;

        $data = $request->validated();

        // Associer l'utilisateur au restaurant de l'admin qui le crée
        if (! $currentUser->isSuperAdmin() && $currentUser->restaurant_id) {
            $data['restaurant_id'] = $currentUser->restaurant_id;
        }

        // Vérifier la limite d'utilisateurs (non-serveurs)
        if ($restaurant && $restaurant->hasReachedUserLimit()) {
            $limitations = $restaurant->getLimitations();
            $maxUsers = $limitations['max_users'] ?? null;
            $currentUsers = $restaurant->users()
                ->where('role', '!=', 'serveur')
                ->where('role', '!=', 'super-admin')
                ->count();

            return redirect()->back()
                ->withInput()
                ->withErrors([
                    'limit_reached' => true,
                    'limit_message' => $maxUsers === null
                        ? 'Impossible de créer plus d\'utilisateurs.'
                        : "Vous avez atteint la limite d'utilisateurs de votre plan ({$currentUsers}/{$maxUsers}). Veuillez upgrader votre abonnement pour ajouter plus d'utilisateurs.",
                ])
                ->with('limit_reached', true)
                ->with('limit_message', $maxUsers === null
                    ? 'Impossible de créer plus d\'utilisateurs.'
                    : "Vous avez atteint la limite d'utilisateurs de votre plan ({$currentUsers}/{$maxUsers}). Veuillez upgrader votre abonnement pour ajouter plus d'utilisateurs.")
                ->with('current_plan', $restaurant->abonnement?->plan ?? 'N/A')
                ->with('current_users', $currentUsers)
                ->with('max_users', $maxUsers);
        }

        // Hasher le mot de passe
        $data['password'] = Hash::make($data['password']);

        // Marquer l'email comme vérifié
        $data['email_verified_at'] = now();

        $user = User::create($data);

        return redirect()->route('user.show', $user)
            ->with('success', 'Utilisateur créé avec succès.');
    }

    /**
     * Afficher les détails d'un utilisateur (Admin uniquement)
     */
    public function show(Request $request, User $user): Response
    {
        $currentUser = $request->user();

        // Vérifier l'accès : les admins ne peuvent voir que les utilisateurs de leur restaurant
        // et pas les super-admins
        if ($user->role === 'super-admin') {
            abort(403, 'Accès refusé à cet utilisateur.');
        }

        if (! $currentUser->isSuperAdmin() && $currentUser->restaurant_id) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                abort(403, 'Accès refusé à cet utilisateur.');
            }
        }

        $user->loadCount(['ventes', 'stockMovements']);

        return Inertia::render('User/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Afficher le formulaire de modification d'un utilisateur (Admin uniquement)
     */
    public function edit(Request $request, User $user): Response
    {
        $currentUser = $request->user();

        // Vérifier l'accès : les admins ne peuvent modifier que les utilisateurs de leur restaurant
        // et pas les super-admins
        if ($user->role === 'super-admin') {
            abort(403, 'Accès refusé à cet utilisateur.');
        }

        if (! $currentUser->isSuperAdmin() && $currentUser->restaurant_id) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                abort(403, 'Accès refusé à cet utilisateur.');
            }
        }

        return Inertia::render('User/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Mettre à jour un utilisateur (Admin uniquement)
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        // Vérifier l'accès : les admins ne peuvent modifier que les utilisateurs de leur restaurant
        // et pas les super-admins
        if ($user->role === 'super-admin') {
            abort(403, 'Accès refusé à cet utilisateur.');
        }

        if (! $currentUser->isSuperAdmin() && $currentUser->restaurant_id) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                abort(403, 'Accès refusé à cet utilisateur.');
            }
        }

        $data = $request->validated();

        // Ne pas mettre à jour le mot de passe ici (utiliser updatePassword)
        unset($data['password']);

        // Ne pas permettre de changer le rôle en super-admin
        if (isset($data['role']) && $data['role'] === 'super-admin') {
            unset($data['role']);
        }

        // Ne pas permettre de changer le restaurant_id pour les admins non super-admin
        if (! $currentUser->isSuperAdmin()) {
            unset($data['restaurant_id']);
        }

        $user->update($data);

        return redirect()->route('user.show', $user)
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    /**
     * Mettre à jour le mot de passe d'un utilisateur (Admin uniquement)
     */
    public function updatePassword(UpdateUserPasswordRequest $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        // Vérifier l'accès : les admins ne peuvent modifier que les utilisateurs de leur restaurant
        // et pas les super-admins
        if ($user->role === 'super-admin') {
            abort(403, 'Accès refusé à cet utilisateur.');
        }

        if (! $currentUser->isSuperAdmin() && $currentUser->restaurant_id) {
            if ($user->restaurant_id !== $currentUser->restaurant_id) {
                abort(403, 'Accès refusé à cet utilisateur.');
            }
        }

        $user->update([
            'password' => $request->validated()['password'],
        ]);

        return redirect()->route('user.show', $user)
            ->with('success', 'Mot de passe mis à jour avec succès.');
    }
}
