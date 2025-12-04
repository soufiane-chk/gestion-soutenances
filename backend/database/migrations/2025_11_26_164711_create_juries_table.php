<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('juries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('soutenance_id');
            $table->unsignedBigInteger('encadrant_id');
            $table->unsignedBigInteger('rapporteur_id');
            $table->unsignedBigInteger('examinateur_id');
            $table->unsignedBigInteger('president_id');
            $table->timestamps();
            $table->foreign('soutenance_id')->references('id')->on('soutenances')->onDelete('cascade');
            $table->foreign('encadrant_id')->references('id')->on('professeurs')->onDelete('cascade');
            $table->foreign('rapporteur_id')->references('id')->on('professeurs')->onDelete('cascade');
            $table->foreign('examinateur_id')->references('id')->on('professeurs')->onDelete('cascade');
            $table->foreign('president_id')->references('id')->on('professeurs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('juries');
    }
};
