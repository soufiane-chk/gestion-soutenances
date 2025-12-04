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
            $table->enum('validation_status', ['en_attente', 'valide', 'non_valide'])->default('en_attente')->after('statut');
            $table->text('raison_non_validation')->nullable()->after('validation_status');
            $table->date('date_soutenance')->nullable()->after('raison_non_validation');
            $table->string('lieu_soutenance')->nullable()->after('date_soutenance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports', function (Blueprint $table) {
            $table->dropColumn(['validation_status', 'raison_non_validation', 'date_soutenance', 'lieu_soutenance']);
        });
    }
};
