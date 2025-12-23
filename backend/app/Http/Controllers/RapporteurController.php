<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RapporteurController extends Controller
{
    /**
     * Ajouter des remarques à un rapport
     */
    public function ajouterRemarques(Request $request, $rapportId)
    {
        $request->validate([
            'remarque' => 'required|string',
        ]);

        $user = Auth::user();
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rapport = Rapport::with('etudiant')->findOrFail($rapportId);
        $professeur = \App\Models\Professeur::where('user_id', $user->id)->firstOrFail();

        // Vérifier que le professeur est bien le rapporteur de cet étudiant
        if ($rapport->etudiant->rapporteur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'êtes pas le rapporteur de cet étudiant'], 403);
        }

        $rapport->remarque = $request->remarque;
        $rapport->statut = 'corrige';
        $rapport->save();

        return response()->json([
            'message' => 'Remarques ajoutées avec succès',
            'rapport' => $rapport
        ]);
    }

    /**
     * Valider un rapport
     */
    public function validerRapport(Request $request, $rapportId)
    {
        $user = Auth::user();
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rapport = Rapport::with('etudiant')->findOrFail($rapportId);
        $professeur = \App\Models\Professeur::where('user_id', $user->id)->firstOrFail();

        // Vérifier que le professeur est bien le rapporteur de cet étudiant
        if ($rapport->etudiant->rapporteur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'êtes pas le rapporteur de cet étudiant'], 403);
        }

        $rapport->statut = 'valide';
        $rapport->save();

        return response()->json([
            'message' => 'Rapport validé avec succès',
            'rapport' => $rapport
        ]);
    }
}

