<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\SoutenanceController;
use App\Http\Controllers\EtudiantController;

// Route de connexion (publique)
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (nécessitent une authentification)
Route::middleware(['auth:sanctum'])->group(function () {
    // Authentification
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // CRUD Rapports
    Route::apiResource('rapports', RapportController::class);
    Route::get('rapports/{id}/download', [RapportController::class, 'download']);

    // CRUD Soutenances
    Route::apiResource('soutenances', SoutenanceController::class);

    // CRUD Étudiants
    Route::apiResource('etudiants', EtudiantController::class);
});
