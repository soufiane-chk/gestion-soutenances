<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->foreignId('encadrant_id')->nullable()->after('contact_etudiant')->constrained('professeurs')->onDelete('set null');
            $table->foreignId('rapporteur_id')->nullable()->after('encadrant_id')->constrained('professeurs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropForeign(['encadrant_id']);
            $table->dropForeign(['rapporteur_id']);
            $table->dropColumn(['encadrant_id', 'rapporteur_id']);
        });
    }
};
