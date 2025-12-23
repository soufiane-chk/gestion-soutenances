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
            $table->string('document_stage')->nullable()->after('niveau');
            $table->string('convention')->nullable()->after('document_stage');
            $table->string('assurance')->nullable()->after('convention');
            $table->enum('validation_documents', ['en_attente', 'valide', 'rejete'])->default('en_attente')->after('assurance');
            $table->text('raison_rejet_documents')->nullable()->after('validation_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn(['document_stage', 'convention', 'assurance', 'validation_documents', 'raison_rejet_documents']);
        });
    }
};
