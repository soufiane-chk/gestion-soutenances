<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Supprimer la colonne validation_status
        Schema::table('rapports', function (Blueprint $table) {
            $table->dropColumn('validation_status');
        });

        // Modifier l'enum statut pour ajouter 'non_valide'
        DB::statement("ALTER TABLE rapports MODIFY COLUMN statut ENUM('depose', 'corrige', 'valide', 'non_valide') DEFAULT 'depose'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurer l'enum statut sans 'non_valide'
        DB::statement("ALTER TABLE rapports MODIFY COLUMN statut ENUM('depose', 'corrige', 'valide') DEFAULT 'depose'");

        // Recréer la colonne validation_status
        Schema::table('rapports', function (Blueprint $table) {
            $table->enum('validation_status', ['en_attente', 'valide', 'non_valide'])->default('en_attente')->after('statut');
        });
    }
};
