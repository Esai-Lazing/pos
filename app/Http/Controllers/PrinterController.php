<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrinterRequest;
use App\Models\Printer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrinterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Printer::query();

        // Filtrer par restaurant_id (sauf pour super-admin)
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $query->where('restaurant_id', $user->restaurant_id);
        }

        $printers = $query->latest()->get();

        return Inertia::render('Printer/Index', [
            'printers' => $printers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Printer/Create');
    }

    public function store(StorePrinterRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Ajouter restaurant_id si l'utilisateur n'est pas super-admin
        if (!$user->isSuperAdmin() && $user->restaurant_id) {
            $data['restaurant_id'] = $user->restaurant_id;
        }

        Printer::create($data);

        return redirect()->route('printer.index')
            ->with('success', 'Imprimante configurée avec succès.');
    }

    public function edit(Request $request, Printer $printer): Response
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette imprimante
        if (!$user->isSuperAdmin() && $printer->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette imprimante.');
        }

        return Inertia::render('Printer/Edit', [
            'printer' => $printer,
        ]);
    }

    public function update(StorePrinterRequest $request, Printer $printer): RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette imprimante
        if (!$user->isSuperAdmin() && $printer->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette imprimante.');
        }

        $printer->update($request->validated());

        return redirect()->route('printer.index')
            ->with('success', 'Imprimante mise à jour avec succès.');
    }

    public function destroy(Request $request, Printer $printer): RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès à cette imprimante
        if (!$user->isSuperAdmin() && $printer->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Accès refusé à cette imprimante.');
        }

        $printer->delete();

        return redirect()->route('printer.index')
            ->with('success', 'Imprimante supprimée avec succès.');
    }
}
