<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServeurRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ServeurController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $serveurs = User::where('role', 'serveur')
            ->where('restaurant_id', $user->restaurant_id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Serveur/Index', [
            'serveurs' => $serveurs,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Serveur/Create');
    }

    public function store(StoreServeurRequest $request): RedirectResponse
    {
        $user = $request->user();

        User::create([
            'name' => $request->name,
            'email' => 'serveur-'.uniqid().'@restaurant.local', // Email temporaire
            'password' => Hash::make($request->pin_code), // Utiliser le PIN comme mot de passe
            'role' => 'serveur',
            'restaurant_id' => $user->restaurant_id,
            'pin_code' => $request->pin_code,
            'is_active' => true,
        ]);

        return redirect()->route('serveur.index')
            ->with('success', 'Serveur créé avec succès.');
    }

    public function destroy(User $serveur): RedirectResponse
    {
        if ($serveur->role !== 'serveur') {
            abort(403, 'Cet utilisateur n\'est pas un serveur.');
        }

        $serveur->delete();

        return redirect()->route('serveur.index')
            ->with('success', 'Serveur supprimé avec succès.');
    }
}
