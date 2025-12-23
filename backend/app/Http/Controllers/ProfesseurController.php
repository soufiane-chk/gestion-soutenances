<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfesseurController extends Controller
{
    /**
     * Liste de tous les professeurs
     */
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $professeurs = Professeur::with('user')->get();
        return response()->json($professeurs);
    }

    /**
     * Liste des étudiants affectés à un professeur (encadrant)
     */
    public function mesEtudiants()
    {
        $user = Auth::user();
        
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $professeur = Professeur::where('user_id', $user->id)->firstOrFail();
        $etudiants = Etudiant::where('encadrant_id', $professeur->id)
            ->with(['user', 'rapports'])
            ->get()
            ->map(function($etudiant) {
                return [
                    'id' => $etudiant->id,
                    'nom' => $etudiant->nom,
                    'prenom' => $etudiant->prenom,
                    'email' => $etudiant->email,
                    'contact_etudiant' => $etudiant->contact_etudiant,
                    'sujet_stage' => $etudiant->sujet_stage,
                    'entreprise' => $etudiant->entreprise,
                    'duree_stage' => $etudiant->duree_stage,
                    'rapports' => $etudiant->rapports,
                ];
            });

        return response()->json($etudiants);
    }

    /**
     * Affecter un rapporteur à un étudiant (admin)
     */
    public function affecterRapporteur(Request $request, $etudiantId)
    {
        $request->validate([
            'rapporteur_id' => 'required|exists:professeurs,id',
        ]);

        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $etudiant = Etudiant::findOrFail($etudiantId);
        $etudiant->rapporteur_id = $request->rapporteur_id;
        $etudiant->save();

        return response()->json([
            'message' => 'Rapporteur affecté avec succès',
            'etudiant' => $etudiant->load('rapporteur.user')
        ]);
    }

    /**
     * Liste des rapports à évaluer par un rapporteur
     */
    public function rapportsAEvaluer()
    {
        $user = Auth::user();
        
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $professeur = Professeur::where('user_id', $user->id)->firstOrFail();
        $etudiants = Etudiant::where('rapporteur_id', $professeur->id)
            ->with(['user', 'rapports'])
            ->get();

        return response()->json($etudiants);
    }
}
