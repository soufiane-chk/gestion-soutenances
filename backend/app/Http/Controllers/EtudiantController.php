<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    /**
     * Liste de tous les étudiants
     */
    public function index()
    {
        $etudiants = Etudiant::orderBy('nom')->get();
        return response()->json($etudiants);
    }

    /**
     * Créer un nouvel étudiant
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email',
        ]);

        $etudiant = Etudiant::create($request->all());
        return response()->json($etudiant, 201);
    }

    /**
     * Afficher un étudiant
     */
    public function show(string $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        return response()->json($etudiant);
    }

    /**
     * Mettre à jour un étudiant
     */
    public function update(Request $request, string $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        $etudiant->update($request->all());
        return response()->json($etudiant);
    }

    /**
     * Supprimer un étudiant
     */
    public function destroy(string $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        $etudiant->delete();
        return response()->json(['message' => 'Étudiant supprimé']);
    }
}
