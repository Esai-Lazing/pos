<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'restaurant.access'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    
    // Page d'aide
    Route::get('aide', function () {
        return Inertia::render('Aide/Index');
    })->name('aide');

    // Routes Stock (Admin et Stock)
    Route::middleware(['role:admin,stock'])->prefix('stock')->name('stock.')->group(function () {
        Route::get('/', [\App\Http\Controllers\StockController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\StockController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\StockController::class, 'store'])->name('store');
        Route::get('/{produit}', [\App\Http\Controllers\StockController::class, 'show'])->name('show');
        Route::get('/{produit}/edit', [\App\Http\Controllers\StockController::class, 'edit'])->name('edit');
        Route::put('/{produit}', [\App\Http\Controllers\StockController::class, 'update'])->name('update');
        Route::delete('/{produit}', [\App\Http\Controllers\StockController::class, 'destroy'])->name('destroy');
        Route::post('/mouvement', [\App\Http\Controllers\StockController::class, 'mouvement'])->name('mouvement');
    });

    // Routes Vente (Admin et Caisse)
    Route::middleware(['role:admin,caisse'])->prefix('vente')->name('vente.')->group(function () {
        Route::get('/', [\App\Http\Controllers\VenteController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\VenteController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\VenteController::class, 'store'])->name('store');
        Route::get('/{vente}', [\App\Http\Controllers\VenteController::class, 'show'])->name('show');
        Route::get('/{vente}/edit', [\App\Http\Controllers\VenteController::class, 'edit'])->name('edit');
        Route::put('/{vente}', [\App\Http\Controllers\VenteController::class, 'update'])->name('update');
        Route::post('/{vente}/imprimer', [\App\Http\Controllers\VenteController::class, 'imprimer'])->name('imprimer');
        Route::get('/{vente}/print-receipt', [\App\Http\Controllers\VenteController::class, 'printReceipt'])->name('print-receipt');
    });

    // Routes Rapports (Admin uniquement)
    Route::middleware(['role:admin'])->prefix('rapport')->name('rapport.')->group(function () {
        Route::get('/', [\App\Http\Controllers\RapportController::class, 'index'])->name('index');
    });

    // Routes Imprimante (Admin uniquement)
    Route::middleware(['role:admin'])->prefix('printer')->name('printer.')->group(function () {
        Route::get('/', [\App\Http\Controllers\PrinterController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\PrinterController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\PrinterController::class, 'store'])->name('store');
        Route::get('/{printer}/edit', [\App\Http\Controllers\PrinterController::class, 'edit'])->name('edit');
        Route::put('/{printer}', [\App\Http\Controllers\PrinterController::class, 'update'])->name('update');
        Route::delete('/{printer}', [\App\Http\Controllers\PrinterController::class, 'destroy'])->name('destroy');
    });

    // Routes Utilisateurs (Admin uniquement)
    Route::middleware(['role:admin'])->prefix('user')->name('user.')->group(function () {
        Route::get('/', [\App\Http\Controllers\UserController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\UserController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\UserController::class, 'store'])->name('store');
        Route::get('/{user}', [\App\Http\Controllers\UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('update');
        Route::put('/{user}/password', [\App\Http\Controllers\UserController::class, 'updatePassword'])->name('update-password');
    });

    // Routes Restaurants (Super-admin uniquement)
    Route::middleware(['role:super-admin'])->prefix('restaurant')->name('restaurant.')->group(function () {
        Route::get('/', [\App\Http\Controllers\RestaurantController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\RestaurantController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\RestaurantController::class, 'store'])->name('store');
        Route::get('/{restaurant}', [\App\Http\Controllers\RestaurantController::class, 'show'])->name('show');
        Route::post('/{restaurant}/suspend', [\App\Http\Controllers\RestaurantController::class, 'suspend'])->name('suspend');
        Route::post('/{restaurant}/activate', [\App\Http\Controllers\RestaurantController::class, 'activate'])->name('activate');
        Route::delete('/{restaurant}', [\App\Http\Controllers\RestaurantController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [\App\Http\Controllers\RestaurantController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force-delete', [\App\Http\Controllers\RestaurantController::class, 'forceDelete'])->name('force-delete');
        
        // Routes Abonnements
        Route::get('/{restaurant}/abonnement/edit', [\App\Http\Controllers\AbonnementController::class, 'edit'])->name('abonnement.edit');
        Route::put('/{restaurant}/abonnement', [\App\Http\Controllers\AbonnementController::class, 'update'])->name('abonnement.update');
        Route::post('/{restaurant}/abonnement/suspend', [\App\Http\Controllers\AbonnementController::class, 'suspend'])->name('abonnement.suspend');
        Route::post('/{restaurant}/abonnement/activate', [\App\Http\Controllers\AbonnementController::class, 'activate'])->name('abonnement.activate');
    });

    // Routes Serveurs (Admin uniquement)
    Route::middleware(['role:admin'])->prefix('serveur')->name('serveur.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ServeurController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\ServeurController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\ServeurController::class, 'store'])->name('store');
        Route::delete('/{serveur}', [\App\Http\Controllers\ServeurController::class, 'destroy'])->name('destroy');
    });

    // Routes Customisation Restaurant (Admin uniquement)
    Route::middleware(['role:admin'])->prefix('restaurant/customization')->name('restaurant.customization.')->group(function () {
        Route::get('/edit', [\App\Http\Controllers\RestaurantCustomizationController::class, 'edit'])->name('edit');
        Route::put('/', [\App\Http\Controllers\RestaurantCustomizationController::class, 'update'])->name('update');
    });
});

// Routes publiques pour l'authentification des serveurs
Route::prefix('serveur')->name('serveur.')->group(function () {
    Route::get('/login', [\App\Http\Controllers\ServeurAuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [\App\Http\Controllers\ServeurAuthController::class, 'login'])->name('login.post');
});

// Routes pour les serveurs connectés
Route::middleware(['auth', 'role:serveur', 'restaurant.access'])->prefix('serveur')->name('serveur.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Serveur/Dashboard');
    })->name('dashboard');
    Route::get('/vente/create', [\App\Http\Controllers\VenteController::class, 'create'])->name('vente.create');
    Route::post('/vente', [\App\Http\Controllers\VenteController::class, 'store'])->name('vente.store');
    Route::get('/vente', function (Request $request) {
        $user = $request->user();
        $ventes = \App\Models\Vente::with(['items.produit'])
            ->where('user_id', $user->id)
            ->where('restaurant_id', $user->restaurant_id)
            ->latest()
            ->paginate(20);
        
        return Inertia::render('Serveur/Ventes', [
            'ventes' => $ventes,
        ]);
    })->name('vente.index');
    Route::get('/vente/{vente}', [\App\Http\Controllers\VenteController::class, 'show'])->name('vente.show');
    Route::post('/logout', [\App\Http\Controllers\ServeurAuthController::class, 'logout'])->name('logout');
});

require __DIR__.'/settings.php';
