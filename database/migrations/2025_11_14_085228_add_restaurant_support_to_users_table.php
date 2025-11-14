<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'restaurant_id')) {
                $table->foreignId('restaurant_id')->nullable()->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('users', 'pin_code')) {
                $table->string('pin_code', 4)->nullable(); // Pour les serveurs
            }
        });

        // Pour SQLite, on change simplement le type de la colonne role en string
        // Pour MySQL/MariaDB, on utilise MODIFY COLUMN pour l'ENUM
        $driver = DB::getDriverName();
        
        if ($driver !== 'sqlite') {
            // MySQL/MariaDB: modifier la colonne ENUM
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super-admin', 'admin', 'caisse', 'stock', 'serveur') DEFAULT 'caisse'");
        }
        // Pour SQLite, la colonne role est déjà un string, donc pas besoin de modification
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn(['restaurant_id', 'pin_code']);
        });

        $driver = DB::getDriverName();
        
        if ($driver === 'sqlite') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('caisse')->after('email');
            });
        } else {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'caisse', 'stock') DEFAULT 'caisse'");
        }
    }
};
