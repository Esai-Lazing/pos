<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ServeurAuthController extends Controller
{
    public function showLoginForm(): Response
    {
        return Inertia::render('Serveur/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'pin_code' => ['required', 'string', 'size:4', 'regex:/^[0-9]{4}$/'],
        ]);

        $serveur = User::where('pin_code', $request->pin_code)
            ->where('role', 'serveur')
            ->where('is_active', true)
            ->first();

        if (!$serveur) {
            return back()->withErrors([
                'pin_code' => 'Code PIN invalide.',
            ]);
        }

        Auth::login($serveur);

        return redirect()->route('serveur.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('serveur.login');
    }
}
