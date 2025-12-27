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
        Schema::table('juries', function (Blueprint $table) {
            $table->unsignedBigInteger('rapporteur_id')->nullable()->change();
            // We can also make encadrant nullable if needed, but let's stick to rapporteur first as it's the most likely to be removed.
            // Actually, let's make encadrant nullable too just in case the logic changes to "no supervisor in jury table".
            $table->unsignedBigInteger('encadrant_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('juries', function (Blueprint $table) {
            $table->unsignedBigInteger('rapporteur_id')->nullable(false)->change();
            $table->unsignedBigInteger('encadrant_id')->nullable(false)->change();
        });
    }
};
