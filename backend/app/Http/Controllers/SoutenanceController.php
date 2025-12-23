<?php

namespace App\Http\Controllers;

use App\Models\Soutenance;
use App\Models\Jury;
use Illuminate\Http\Request;

class SoutenanceController extends Controller
{
    /**
     * Liste de toutes les soutenances
     */
    public function index()
    {
        $soutenances = Soutenance::with('etudiant')->orderBy('date_soutenance')->get();
        return response()->json($soutenances);
    }

    /**
     * Créer une nouvelle soutenance
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_etudiant' => 'required|exists:etudiants,id',
            'date_soutenance' => 'required|date',
            'heure_soutenance' => 'required|date_format:H:i',
            'salle' => 'required|string',
            'encadrant_id' => 'required|exists:professeurs,id',
            'rapporteur_id' => 'required|exists:professeurs,id',
            'examinateur_id' => 'required|exists:professeurs,id',
            'president_id' => 'required|exists:professeurs,id',
        ]);

        // Vérifier que l'utilisateur est admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier qu'il n'y a pas déjà une soutenance à cette date/heure/salle
        $existing = Soutenance::where('date_soutenance', $request->date_soutenance)
            ->where('heure_soutenance', $request->heure_soutenance)
            ->where('salle', $request->salle)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Cette salle est déjà réservée à cette date et heure'
            ], 422);
        }

        // Vérifier que chaque professeur n'a pas déjà une soutenance à cette date/heure
        $professeursIds = [
            $request->encadrant_id,
            $request->rapporteur_id,
            $request->examinateur_id,
            $request->president_id
        ];

        foreach ($professeursIds as $profId) {
            $hasConflict = \App\Models\Jury::whereHas('soutenance', function($query) use ($request) {
                $query->where('date_soutenance', $request->date_soutenance)
                      ->where('heure_soutenance', $request->heure_soutenance);
            })
            ->where(function($query) use ($profId) {
                $query->where('encadrant_id', $profId)
                      ->orWhere('rapporteur_id', $profId)
                      ->orWhere('examinateur_id', $profId)
                      ->orWhere('president_id', $profId);
            })
            ->exists();

            if ($hasConflict) {
                $prof = \App\Models\Professeur::find($profId);
                return response()->json([
                    'message' => 'Le professeur ' . $prof->user->nom . ' a déjà une soutenance à cette date et heure'
                ], 422);
            }
        }

        // Créer la soutenance
        $soutenance = Soutenance::create([
            'id_etudiant' => $request->id_etudiant,
            'date_soutenance' => $request->date_soutenance,
            'heure_soutenance' => $request->heure_soutenance,
            'salle' => $request->salle,
            'status' => 'planifiee',
        ]);

        // Créer le jury
        \App\Models\Jury::create([
            'soutenance_id' => $soutenance->id,
            'encadrant_id' => $request->encadrant_id,
            'rapporteur_id' => $request->rapporteur_id,
            'examinateur_id' => $request->examinateur_id,
            'president_id' => $request->president_id,
        ]);

        return response()->json($soutenance->load('jury'), 201);
    }

    /**
     * Afficher une soutenance
     */
    public function show(string $id)
    {
        $soutenance = Soutenance::with('etudiant')->findOrFail($id);
        return response()->json($soutenance);
    }

    /**
     * Mettre à jour une soutenance
     */
    public function update(Request $request, string $id)
    {
        $soutenance = Soutenance::findOrFail($id);
        $soutenance->update($request->all());
        return response()->json($soutenance);
    }

    /**
     * Supprimer une soutenance
     */
    public function destroy(string $id)
    {
        $soutenance = Soutenance::findOrFail($id);
        $soutenance->delete();
        return response()->json(['message' => 'Soutenance supprimée']);
    }
}
