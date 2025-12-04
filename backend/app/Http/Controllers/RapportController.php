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
            'fichier' => 'required|file',
            'date_depot' => 'required|date',
        ]);

        // Enregistrer le fichier
        $fichier = $request->file('fichier')->store('rapports', 'public');

        // Créer le rapport
        $rapport = Rapport::create([
            'etudiant_id' => $request->etudiant_id,
            'fichier' => $fichier,
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

        $rapport->save();
        return response()->json($rapport);
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
