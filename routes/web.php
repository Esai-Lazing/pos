<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\ServeurController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VenteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Webhooks (sans authentification)
Route::post('/webhooks/stripe', [\App\Http\Controllers\WebhookController::class, 'stripe'])->name('webhooks.stripe');
Route::post('/webhooks/mobile-money/{provider?}', [\App\Http\Controllers\WebhookController::class, 'mobileMoney'])->name('webhooks.mobile-money');

Route::middleware(['auth'])->group(function () {
    // Payment routes (sans vérification de paiement)
    Route::get('/payment', [PaymentController::class, 'show'])->name('payment.show');
    Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/cancel', [PaymentController::class, 'cancel'])->name('payment.cancel');
    Route::post('/payment/initiate-mobile-money', [PaymentController::class, 'initiateMobileMoney'])->name('payment.initiate-mobile-money');
    Route::post('/payment/verify-otp', [PaymentController::class, 'verifyOtp'])->name('payment.verify-otp');
    Route::post('/payment/resend-otp', [PaymentController::class, 'resendOtp'])->name('payment.resend-otp');
    Route::get('/payment/mobile-money/callback/{provider}', [PaymentController::class, 'mobileMoneyCallback'])->name('payment.mobile-money.callback');
    Route::post('/payment/credit-card', [PaymentController::class, 'processCreditCard'])->name('payment.credit-card');
    Route::post('/payment/change-method', [PaymentController::class, 'changePaymentMethod'])->name('payment.change-method');

    // Routes admin pour la gestion des abonnements (sans vérification de paiement)
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/admin/subscriptions', [\App\Http\Controllers\SubscriptionManagementController::class, 'index'])->name('admin.subscriptions.index');
        Route::get('/admin/subscriptions/{abonnement}', [\App\Http\Controllers\SubscriptionManagementController::class, 'show'])->name('admin.subscriptions.show');
        Route::post('/admin/subscriptions/{abonnement}/validate', [\App\Http\Controllers\SubscriptionManagementController::class, 'validatePayment'])->name('admin.subscriptions.validate');
        Route::post('/admin/subscriptions/{abonnement}/reject', [\App\Http\Controllers\SubscriptionManagementController::class, 'rejectPayment'])->name('admin.subscriptions.reject');
        Route::post('/admin/subscriptions/{abonnement}/change-payment-method', [\App\Http\Controllers\SubscriptionManagementController::class, 'changePaymentMethod'])->name('admin.subscriptions.change-payment-method');
    });

    // Routes protégées nécessitant un paiement validé
    Route::middleware([\App\Http\Middleware\CheckPaymentStatus::class])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Subscription management
        Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('/subscription/update-plan', [SubscriptionController::class, 'updatePlan'])->name('subscription.update-plan');
        Route::post('/subscription/{abonnement}/invoice', [SubscriptionController::class, 'generateInvoice'])->name('subscription.generate-invoice');

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
            Route::post('/stock/mouvement', [StockController::class, 'mouvement'])->name('stock.mouvement');
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
            Route::get('/vente/{vente}/edit', [VenteController::class, 'edit'])->name('vente.edit');
            Route::put('/vente/{vente}', [VenteController::class, 'update'])->name('vente.update');
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
            Route::get('/printer/create', [PrinterController::class, 'create'])->name('printer.create');
            Route::post('/printer', [PrinterController::class, 'store'])->name('printer.store');
            Route::get('/printer/{printer}/edit', [PrinterController::class, 'edit'])->name('printer.edit');
            Route::put('/printer/{printer}', [PrinterController::class, 'update'])->name('printer.update');
            Route::get('/printer/receipt/{vente}', [PrinterController::class, 'getReceiptData'])->name('printer.receipt');
        });

        // Serveur routes - Admin only
        Route::middleware('role:admin')->group(function () {
            Route::get('/serveur', [\App\Http\Controllers\ServeurController::class, 'index'])->name('serveur.index');
            Route::get('/serveur/create', [\App\Http\Controllers\ServeurController::class, 'create'])->name('serveur.create');
            Route::post('/serveur', [\App\Http\Controllers\ServeurController::class, 'store'])->name('serveur.store');
            Route::delete('/serveur/{serveur}', [\App\Http\Controllers\ServeurController::class, 'destroy'])->name('serveur.destroy');
        });

        // Restaurant customization routes - Admin only (vérifie aussi l'abonnement)
        Route::middleware('role:admin')->group(function () {
            Route::get('/restaurant/customization/edit', [\App\Http\Controllers\RestaurantCustomizationController::class, 'edit'])->name('restaurant.customization.edit');
            Route::post('/restaurant/customization', [\App\Http\Controllers\RestaurantCustomizationController::class, 'update'])->name('restaurant.customization.update');
            Route::patch('/restaurant/customization/typography', [\App\Http\Controllers\RestaurantCustomizationController::class, 'updateTypography'])->name('restaurant.customization.update-typography');
            Route::patch('/restaurant/customization/theme', [\App\Http\Controllers\RestaurantCustomizationController::class, 'updateTheme'])->name('restaurant.customization.update-theme');
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

            // Validation des paiements en espèce
            Route::post('/payment/{abonnement}/validate', [PaymentController::class, 'validateCashPayment'])->name('payment.validate');
            Route::post('/payment/{abonnement}/reject', [PaymentController::class, 'rejectCashPayment'])->name('payment.reject');
        });
    }); // Fin du middleware CheckPaymentStatus
});
