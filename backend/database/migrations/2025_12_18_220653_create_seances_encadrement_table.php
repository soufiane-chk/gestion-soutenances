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
        Schema::create('seances_encadrement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encadrant_id')->constrained('professeurs')->onDelete('cascade');
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->date('date_seance');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->integer('duree_minutes')->default(30);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['encadrant_id', 'etudiant_id', 'date_seance']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seances_encadrement');
    }
};
