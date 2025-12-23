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
            $table->string('sujet_stage')->nullable()->after('filiere');
            $table->string('entreprise')->nullable()->after('sujet_stage');
            $table->string('domaine_stage')->nullable()->after('entreprise');
            $table->integer('duree_stage')->nullable()->comment('Durée en semaines')->after('domaine_stage');
            $table->string('contact_etudiant')->nullable()->after('duree_stage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn(['sujet_stage', 'entreprise', 'domaine_stage', 'duree_stage', 'contact_etudiant']);
        });
    }
};
