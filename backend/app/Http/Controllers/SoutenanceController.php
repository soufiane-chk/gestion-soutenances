<?php

namespace App\Http\Controllers;

use App\Models\Soutenance;
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
            'id_etudiant' => 'required',
            'date_soutenance' => 'required|date',
            'heure_soutenance' => 'required',
            'salle' => 'required',
        ]);

        $soutenance = Soutenance::create($request->all());
        return response()->json($soutenance, 201);
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
