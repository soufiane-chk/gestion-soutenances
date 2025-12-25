<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Professeur;
use App\Models\SeanceEncadrement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EncadrementController extends Controller
{
    /**
     * Affecter un encadrant à un étudiant (admin)
     */
    public function affecterEncadrant(Request $request, $etudiantId)
    {
        $request->validate([
            'encadrant_id' => 'required|exists:professeurs,id',
        ]);

        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $etudiant = Etudiant::findOrFail($etudiantId);
        $encadrant = Professeur::findOrFail($request->encadrant_id);

        // Vérifier que l'encadrant a la même spécialité/domaine que le stage
        if ($encadrant->specialite !== $etudiant->domaine_stage) {
            return response()->json([
                'message' => 'L\'encadrant doit avoir la même spécialité que le domaine du stage'
            ], 422);
        }

        $etudiant->encadrant_id = $request->encadrant_id;
        $etudiant->save();

        return response()->json([
            'message' => 'Encadrant affecté avec succès',
            'etudiant' => $etudiant->load('encadrant.user')
        ]);
    }

    /**
     * Liste des étudiants affectés à un encadrant
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
            ->get();

        return response()->json($etudiants);
    }

    /**
     * Créer une séance d'encadrement
     */
    public function creerSeance(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'date_seance' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'duree_minutes' => 'required|integer|min:30',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $professeur = Professeur::where('user_id', $user->id)->firstOrFail();
        $etudiant = Etudiant::findOrFail($request->etudiant_id);

        // Vérifier que l'étudiant est bien affecté à cet encadrant
        if ($etudiant->encadrant_id !== $professeur->id) {
            return response()->json(['message' => 'Cet étudiant n\'est pas affecté à vous'], 403);
        }

        // Calculer l'heure de fin
        $heureDebut = \Carbon\Carbon::parse($request->date_seance . ' ' . $request->heure_debut);
        $heureFin = $heureDebut->copy()->addMinutes($request->duree_minutes);

        $seance = SeanceEncadrement::create([
            'encadrant_id' => $professeur->id,
            'etudiant_id' => $request->etudiant_id,
            'date_seance' => $request->date_seance,
            'heure_debut' => $heureDebut,
            'heure_fin' => $heureFin,
            'duree_minutes' => $request->duree_minutes,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Séance créée avec succès',
            'seance' => $seance->load('etudiant.user')
        ], 201);
    }

    /**
     * Liste des séances d'encadrement
     */
    public function mesSeances()
    {
        $user = Auth::user();
        
        if ($user->role !== 'professeur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $professeur = Professeur::where('user_id', $user->id)->firstOrFail();
        $seances = SeanceEncadrement::where('encadrant_id', $professeur->id)
            ->with('etudiant.user')
            ->orderBy('date_seance', 'desc')
            ->get();

        return response()->json($seances);
    }

    /**
     * Liste des séances d'un étudiant
     */
    public function seancesEtudiant($etudiantId)
    {
        $user = Auth::user();
        $etudiant = Etudiant::findOrFail($etudiantId);

        // Vérifier les permissions
        if ($user->role !== 'admin' && 
            ($user->role !== 'etudiant' || $user->id !== $etudiant->user_id) &&
            ($user->role !== 'professeur' || $etudiant->encadrant_id !== Professeur::where('user_id', $user->id)->first()?->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $seances = SeanceEncadrement::where('etudiant_id', $etudiantId)
            ->with('encadrant.user')
            ->orderBy('date_seance', 'desc')
            ->get();

        return response()->json($seances);
    }
}

