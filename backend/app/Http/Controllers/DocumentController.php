<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Dépôt des documents par l'étudiant (corrigé pour utiliser l'étudiant connecté)
     */
    public function deposerDocuments(Request $request)
    {
        $request->validate([
            'document_stage' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'convention' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'assurance' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Récupérer l'étudiant lié à l'utilisateur connecté
        $etudiant = Etudiant::where('user_id', Auth::id())->first();
        if (!$etudiant) {
            return response()->json(['message' => 'Etudiant non trouvé'], 404);
        }

        // Enregistrer les fichiers
        if ($request->hasFile('document_stage')) {
            $etudiant->document_stage = $request->file('document_stage')->store('documents/stages', 'public');
        }
        if ($request->hasFile('convention')) {
            $etudiant->convention = $request->file('convention')->store('documents/conventions', 'public');
        }
        if ($request->hasFile('assurance')) {
            $etudiant->assurance = $request->file('assurance')->store('documents/assurances', 'public');
        }

        $etudiant->validation_documents = 'en_attente';
        $etudiant->save();

        return response()->json([
            'message' => 'Documents déposés avec succès',
            'etudiant' => $etudiant
        ], 201);
    }

    /**
     * Validation des documents par l'admin
     */
    public function validerDocuments(Request $request, $etudiantId)
    {
        $request->validate([
            'validation' => 'required|in:valide,rejete',
            'raison_rejet' => 'required_if:validation,rejete|string|nullable',
        ]);

        // Vérifier que l'utilisateur est admin
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $etudiant = Etudiant::findOrFail($etudiantId);
        $etudiant->validation_documents = $request->validation;
        
        if ($request->validation === 'rejete') {
            $etudiant->raison_rejet_documents = $request->raison_rejet;
        } else {
            $etudiant->raison_rejet_documents = null;
        }

        $etudiant->save();

        return response()->json([
            'message' => 'Documents ' . $request->validation,
            'etudiant' => $etudiant
        ]);
    }

    /**
     * Liste des documents en attente de validation (admin)
     */
    public function documentsEnAttente()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $etudiants = Etudiant::where('validation_documents', 'en_attente')
            ->whereNotNull('document_stage')
            ->whereNotNull('convention')
            ->whereNotNull('assurance')
            ->with('user')
            ->get();

        return response()->json($etudiants);
    }

    /**
     * Télécharger un document
     */
    public function download($etudiantId, $type)
    {
        $etudiant = Etudiant::findOrFail($etudiantId);
        
        // Vérifier les permissions
        if (Auth::user()->role !== 'admin' && Auth::user()->id !== $etudiant->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $champ = match($type) {
            'document_stage' => 'document_stage',
            'convention' => 'convention',
            'assurance' => 'assurance',
            default => null,
        };

        if (!$champ || !$etudiant->$champ) {
            return response()->json(['message' => 'Document non trouvé'], 404);
        }

        return Storage::disk('public')->download($etudiant->$champ);
    }

    /**
     * Déposer un document (simplifié)
     */
    public function deposerDocument(Request $request)
    {
        $etudiant = Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json(['message' => 'Etudiant non trouvé'], 404);
        }

        // Traitement du dépôt de document
        // Exemple :
        if ($request->hasFile('document_stage')) {
            $path = $request->file('document_stage')->store('documents');
            $etudiant->document_stage = $path;
            $etudiant->save();
        }

        return response()->json(['message' => 'Document déposé avec succès']);
    }
}

