<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VenteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Route de test pour les traductions
Route::get('/test-translations', function () {
    return Inertia::render('TranslationTest');
})->name('test.translations');

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Stock routes - Admin & Stock role
    Route::middleware('role:admin,stock')->group(function () {
        Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
        Route::get('/stock/create', [StockController::class, 'create'])->name('stock.create');
        Route::post('/stock', [StockController::class, 'store'])
            ->middleware('subscription.limit:products')
            ->name('stock.store');
        Route::get('/stock/{produit}', [StockController::class, 'show'])->name('stock.show');
        Route::get('/stock/{produit}/edit', [StockController::class, 'edit'])->name('stock.edit');
        Route::put('/stock/{produit}', [StockController::class, 'update'])->name('stock.update');
        Route::post('/stock/add', [StockController::class, 'addStock'])->name('stock.add');
        Route::post('/stock/remove', [StockController::class, 'removeStock'])->name('stock.remove');
        Route::get('/stock/{produit}/history', [StockController::class, 'history'])->name('stock.history');
    });

    // Vente routes - Admin & Caisse role
    Route::middleware('role:admin,caisse')->group(function () {
        Route::get('/vente', [VenteController::class, 'index'])->name('vente.index');
        Route::get('/vente/create', [VenteController::class, 'create'])->name('vente.create');
        Route::post('/vente', [VenteController::class, 'store'])
            ->middleware('subscription.limit:sales')
            ->name('vente.store');
        Route::get('/vente/{vente}', [VenteController::class, 'show'])->name('vente.show');
        Route::get('/vente/{vente}/print', [VenteController::class, 'print'])->name('vente.print');
    });

    // Reports routes - Admin only (vérifie aussi l'abonnement)
    Route::middleware('role:admin')->group(function () {
        Route::get('/rapports', [RapportController::class, 'index'])->name('rapports.index');
        Route::get('/rapports/journalier', [RapportController::class, 'journalier'])->name('rapports.journalier');
        Route::get('/rapports/hebdomadaire', [RapportController::class, 'hebdomadaire'])->name('rapports.hebdomadaire');
        Route::get('/rapports/mensuel', [RapportController::class, 'mensuel'])->name('rapports.mensuel');
    });

    // Printer routes - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/printer', [PrinterController::class, 'index'])->name('printer.index');
        Route::put('/printer', [PrinterController::class, 'update'])->name('printer.update');
        Route::get('/printer/receipt/{vente}', [PrinterController::class, 'getReceiptData'])->name('printer.receipt');
    });

    // User routes - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/user', [UserController::class, 'index'])->name('user.index');
        Route::get('/user/create', [UserController::class, 'create'])->name('user.create');
        Route::post('/user', [UserController::class, 'store'])
            ->middleware('subscription.limit:users')
            ->name('user.store');
        Route::get('/user/{user}', [UserController::class, 'show'])->name('user.show');
        Route::get('/user/{user}/edit', [UserController::class, 'edit'])->name('user.edit');
        Route::put('/user/{user}', [UserController::class, 'update'])->name('user.update');
        Route::patch('/user/{user}/password', [UserController::class, 'updatePassword'])->name('user.update-password');
    });

    // Restaurant routes - Super Admin only
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/restaurant', [RestaurantController::class, 'index'])->name('restaurant.index');
        Route::get('/restaurant/create', [RestaurantController::class, 'create'])->name('restaurant.create');
        Route::post('/restaurant', [RestaurantController::class, 'store'])->name('restaurant.store');
        Route::get('/restaurant/{restaurant}', [RestaurantController::class, 'show'])->name('restaurant.show');
        Route::post('/restaurant/{restaurant}/suspend', [RestaurantController::class, 'suspend'])->name('restaurant.suspend');
        Route::post('/restaurant/{restaurant}/activate', [RestaurantController::class, 'activate'])->name('restaurant.activate');
        Route::delete('/restaurant/{restaurant}', [RestaurantController::class, 'destroy'])->name('restaurant.destroy');
        Route::post('/restaurant/{id}/restore', [RestaurantController::class, 'restore'])->name('restaurant.restore');
        Route::delete('/restaurant/{id}/force-delete', [RestaurantController::class, 'forceDelete'])->name('restaurant.force-delete');
    });
});
