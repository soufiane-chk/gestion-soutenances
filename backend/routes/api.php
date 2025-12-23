<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\SoutenanceController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EncadrementController;
use App\Http\Controllers\ProfesseurController;
use App\Http\Controllers\RapporteurController;

// Route de connexion (publique)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Routes protégées (nécessitent une authentification)
Route::middleware(['auth:sanctum'])->group(function () {
    // Authentification
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // CRUD Étudiants
    Route::apiResource('etudiants', EtudiantController::class);

    // Documents étudiants
    Route::post('etudiants/{etudiantId}/documents', [DocumentController::class, 'deposerDocuments']);
    Route::get('etudiants/{etudiantId}/documents/{type}/download', [DocumentController::class, 'download']);
    Route::post('etudiants/{etudiantId}/documents/valider', [DocumentController::class, 'validerDocuments']);
    Route::get('documents/en-attente', [DocumentController::class, 'documentsEnAttente']);

    // Encadrement
    Route::post('etudiants/{etudiantId}/affecter-encadrant', [EncadrementController::class, 'affecterEncadrant']);
    Route::get('encadrement/mes-etudiants', [EncadrementController::class, 'mesEtudiants']);
    Route::post('encadrement/seances', [EncadrementController::class, 'creerSeance']);
    Route::get('encadrement/seances', [EncadrementController::class, 'mesSeances']);
    Route::get('etudiants/{etudiantId}/seances', [EncadrementController::class, 'seancesEtudiant']);

    // Professeurs
    Route::get('professeurs', [ProfesseurController::class, 'index']);
    Route::get('professeurs/mes-etudiants', [ProfesseurController::class, 'mesEtudiants']);
    Route::post('etudiants/{etudiantId}/affecter-rapporteur', [ProfesseurController::class, 'affecterRapporteur']);
    Route::get('professeurs/rapports-a-evaluer', [ProfesseurController::class, 'rapportsAEvaluer']);

    // CRUD Rapports
    Route::apiResource('rapports', RapportController::class);
    Route::get('rapports/{id}/download', [RapportController::class, 'download']);
    Route::post('rapports/{id}/version-finale', [RapportController::class, 'deposerVersionFinale']);

    // Rapporteur
    Route::post('rapports/{rapportId}/remarques', [RapporteurController::class, 'ajouterRemarques']);
    Route::post('rapports/{rapportId}/valider', [RapporteurController::class, 'validerRapport']);

    // CRUD Soutenances
    Route::apiResource('soutenances', SoutenanceController::class);
});
