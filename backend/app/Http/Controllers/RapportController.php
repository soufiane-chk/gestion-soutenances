<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RapportController extends Controller
{
    /**
     * Liste de tous les rapports
     */
    public function index()
    {
        $rapports = Rapport::with('etudiant')->orderBy('date_depot', 'desc')->get();
        return response()->json($rapports);
    }

    /**
     * Créer un nouveau rapport
     */
    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required',
            'fichier' => 'required|file|mimes:pdf,doc,docx|max:20480',
            'date_depot' => 'required|date',
            'feedback_entreprise' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Enregistrer le fichier 
        $fichier = $request->file('fichier')->store('rapports', 'public');
        
        $feedbackEntreprise = null;
        if ($request->hasFile('feedback_entreprise')) {
            $feedbackEntreprise = $request->file('feedback_entreprise')->store('rapports/feedbacks', 'public');
        }

        // Créer le rapport
        $rapport = Rapport::create([
            'etudiant_id' => $request->etudiant_id,
            'fichier' => $fichier,
            'feedback_entreprise' => $feedbackEntreprise,
            'date_depot' => $request->date_depot,
            'statut' => $request->statut ?? 'depose',
            'remarque' => $request->remarque,
        ]);

        return response()->json($rapport, 201);
    }

    /**
     * Afficher un rapport
     */
    public function show(string $id)
    {
        $rapport = Rapport::with('etudiant')->findOrFail($id);
        return response()->json($rapport);
    }

    /**
     * Mettre à jour un rapport
     */
    public function update(Request $request, string $id)
    {
        $rapport = Rapport::findOrFail($id);

        // Mettre à jour les champs fournis
        if ($request->has('statut')) {
            $rapport->statut = $request->statut;
        }
        if ($request->has('remarque')) {
            $rapport->remarque = $request->remarque;
        }
        if ($request->hasFile('fichier')) {
            // Supprimer l'ancien fichier
            if ($rapport->fichier) {
                Storage::disk('public')->delete($rapport->fichier);
            }
            $rapport->fichier = $request->file('fichier')->store('rapports', 'public');
        }
        if ($request->hasFile('feedback_entreprise')) {
            if ($rapport->feedback_entreprise) {
                Storage::disk('public')->delete($rapport->feedback_entreprise);
            }
            $rapport->feedback_entreprise = $request->file('feedback_entreprise')->store('rapports/feedbacks', 'public');
        }
        if ($request->hasFile('version_finale')) {
            if ($rapport->version_finale) {
                Storage::disk('public')->delete($rapport->version_finale);
            }
            $rapport->version_finale = $request->file('version_finale')->store('rapports/versions_finales', 'public');
            $rapport->statut = 'version_finale';
        }

        $rapport->save();
        return response()->json($rapport);
    }

    /**
     * Déposer la version finale du rapport
     */
    public function deposerVersionFinale(Request $request, string $id)
    {
        $request->validate([
            'version_finale' => 'required|file|mimes:pdf,doc,docx|max:20480',
        ]);

        $rapport = Rapport::findOrFail($id);

        // Vérifier que le rapport a été validé
        if ($rapport->statut !== 'valide') {
            return response()->json([
                'message' => 'Le rapport doit être validé avant de déposer la version finale'
            ], 422);
        }

        if ($rapport->version_finale) {
            Storage::disk('public')->delete($rapport->version_finale);
        }

        $rapport->version_finale = $request->file('version_finale')->store('rapports/versions_finales', 'public');
        $rapport->statut = 'version_finale';
        $rapport->save();

        return response()->json([
            'message' => 'Version finale déposée avec succès',
            'rapport' => $rapport
        ]);
    }

    /**
     * Supprimer un rapport
     */
    public function destroy(string $id)
    {
        $rapport = Rapport::findOrFail($id);
        
        // Supprimer le fichier
        if ($rapport->fichier) {
            Storage::disk('public')->delete($rapport->fichier);
        }
        
        $rapport->delete();
        return response()->json(['message' => 'Rapport supprimé']);
    }

    /**
     * Télécharger le fichier d'un rapport
     */
    public function download(string $id)
    {
        $rapport = Rapport::findOrFail($id);
        return Storage::disk('public')->download($rapport->fichier);
    }
}
