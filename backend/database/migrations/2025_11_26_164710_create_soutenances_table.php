<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('soutenances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('etudiant_id');
            $table->unsignedBigInteger('enseignant_id');
            $table->string('theme');
            $table->date('date_soutenance');
            $table->string('salle');
            $table->timestamps();
            $table->foreign('etudiant_id')->references('id')->on('etudiants')->onDelete('cascade');
            $table->foreign('enseignant_id')->references('id')->on('professeurs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soutenances');
    }
};
