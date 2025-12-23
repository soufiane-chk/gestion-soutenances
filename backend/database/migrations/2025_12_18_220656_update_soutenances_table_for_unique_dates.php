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
        // Ajouter un index unique pour s'assurer qu'un professeur ne peut pas avoir deux soutenances à la même date/heure
        // Cette contrainte sera vérifiée au niveau de l'application via le Jury
        Schema::table('soutenances', function (Blueprint $table) {
            $table->unique(['date_soutenance', 'heure_soutenance', 'salle'], 'unique_soutenance_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('soutenances', function (Blueprint $table) {
            $table->dropUnique('unique_soutenance_slot');
        });
    }
};
