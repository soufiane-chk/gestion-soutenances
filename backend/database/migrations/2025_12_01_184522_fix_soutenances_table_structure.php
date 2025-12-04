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
        // Supprimer l'ancienne clé étrangère
        Schema::table('soutenances', function (Blueprint $table) {
            $table->dropForeign(['etudiant_id']);
        });

        // Renommer etudiant_id en id_etudiant (MySQL)
        DB::statement('ALTER TABLE soutenances CHANGE etudiant_id id_etudiant BIGINT UNSIGNED NOT NULL');

        // Recréer la clé étrangère avec le nouveau nom
        Schema::table('soutenances', function (Blueprint $table) {
            $table->foreign('id_etudiant')->references('id')->on('etudiants')->onDelete('cascade');
        });

        // Ajouter les colonnes manquantes
        Schema::table('soutenances', function (Blueprint $table) {
            $table->time('heure_soutenance')->nullable()->after('date_soutenance');
            $table->string('status')->nullable()->after('salle');
        });

        // Supprimer les colonnes non utilisées par le modèle
        Schema::table('soutenances', function (Blueprint $table) {
            if (Schema::hasColumn('soutenances', 'enseignant_id')) {
                $table->dropForeign(['enseignant_id']);
                $table->dropColumn('enseignant_id');
            }
            if (Schema::hasColumn('soutenances', 'theme')) {
                $table->dropColumn('theme');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('soutenances', function (Blueprint $table) {
            // Recréer les colonnes supprimées
            $table->unsignedBigInteger('enseignant_id')->nullable();
            $table->string('theme')->nullable();
            $table->foreign('enseignant_id')->references('id')->on('professeurs')->onDelete('cascade');
        });

        Schema::table('soutenances', function (Blueprint $table) {
            // Supprimer les colonnes ajoutées
            $table->dropColumn(['heure_soutenance', 'status']);
        });

        // Supprimer la clé étrangère
        Schema::table('soutenances', function (Blueprint $table) {
            $table->dropForeign(['id_etudiant']);
        });

        // Renommer id_etudiant en etudiant_id
        DB::statement('ALTER TABLE soutenances CHANGE id_etudiant etudiant_id BIGINT UNSIGNED NOT NULL');

        // Recréer la clé étrangère avec l'ancien nom
        Schema::table('soutenances', function (Blueprint $table) {
            $table->foreign('etudiant_id')->references('id')->on('etudiants')->onDelete('cascade');
        });
    }
};
