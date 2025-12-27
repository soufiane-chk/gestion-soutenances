<?php

namespace App\Http\Controllers;

use App\Models\Jury;
use Illuminate\Http\Request;

class JuryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jurys = Jury::with(['soutenance.etudiant', 'encadrant.user', 'rapporteur.user', 'examinateur.user', 'president.user'])->get();
        return response()->json($jurys);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'soutenance_id' => 'required|exists:soutenances,id|unique:juries,soutenance_id',
            'encadrant_id' => 'nullable|exists:professeurs,id',
            'rapporteur_id' => 'nullable|exists:professeurs,id',
            'examinateur_id' => 'required|exists:professeurs,id',
            'president_id' => 'required|exists:professeurs,id',
        ]);

        $jury = Jury::create($request->all());
        return response()->json($jury, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $jury = Jury::with(['soutenance.etudiant', 'encadrant.user', 'rapporteur.user', 'examinateur.user', 'president.user'])->findOrFail($id);
        return response()->json($jury);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $jury = Jury::findOrFail($id);
        
        $request->validate([
            'soutenance_id' => 'exists:soutenances,id|unique:juries,soutenance_id,' . $id,
            'encadrant_id' => 'nullable|exists:professeurs,id',
            'rapporteur_id' => 'nullable|exists:professeurs,id',
            'examinateur_id' => 'required|exists:professeurs,id',
            'president_id' => 'required|exists:professeurs,id',
        ]);

        $jury->update($request->all());
        return response()->json($jury);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $jury = Jury::findOrFail($id);
        $jury->delete();
        return response()->json(['message' => 'Jury supprimé']);
    }
}
