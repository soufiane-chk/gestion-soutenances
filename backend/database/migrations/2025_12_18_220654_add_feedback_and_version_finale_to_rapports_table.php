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
        Schema::table('rapports', function (Blueprint $table) {
            $table->string('feedback_entreprise')->nullable()->after('fichier');
            $table->string('version_finale')->nullable()->after('feedback_entreprise');
            $table->enum('statut', ['depose', 'corrige', 'valide', 'version_finale'])->default('depose')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports', function (Blueprint $table) {
            $table->dropColumn(['feedback_entreprise', 'version_finale']);
            $table->enum('statut', ['depose', 'corrige', 'valide'])->default('depose')->change();
        });
    }
};
