<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EtudiantController extends Controller
{
    /**
     * Liste de tous les étudiants
     */
    public function index()
    {
        $etudiants = Etudiant::with(['encadrant.user', 'rapporteur.user'])->orderBy('nom')->get();
        return response()->json($etudiants);
    }

    /**
     * Créer un nouvel étudiant
     */
    public function store(Request $request)
    {
        // Si c'est l'admin qui crée l'étudiant depuis le back-office
        if (Auth::user() && Auth::user()->role === 'admin') {
            $data = $request->validate([
                'nom'     => 'required|string|max:255',
                'prenom'  => 'required|string|max:255',
                'email'   => 'required|email|max:255|unique:users,email',
                'filiere' => 'required|string|max:255',
                'niveau'  => 'required|string|max:255',
                'password'=> 'required|string|min:6',
            ]);

            // Créer l'utilisateur associé
            $user = User::create([
                'nom'      => $data['nom'] . ' ' . $data['prenom'],
                'email'    => $data['email'],
                // Le hash est géré par le cast dans le modèle User
                'password' => $data['password'],
                'role'     => 'etudiant',
            ]);

            // Créer la fiche étudiant liée à l'utilisateur
            $etudiant = Etudiant::create([
                'user_id' => $user->id,
                'nom'     => $data['nom'],
                'prenom'  => $data['prenom'],
                'email'   => $data['email'],
                'filiere' => $data['filiere'],
                'niveau'  => $data['niveau'],
            ]);

            return response()->json($etudiant, 201);
        }

        // Cas générique (si jamais utilisé par une autre partie de l'API)
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nom'     => 'required|string|max:255',
            'prenom'  => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'filiere' => 'nullable|string|max:255',
            'niveau'  => 'nullable|string|max:255',
        ]);

        $etudiant = Etudiant::create($data);
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

        // Validation des données de base
        $data = $request->validate([
            'nom'     => 'sometimes|required|string|max:255',
            'prenom'  => 'sometimes|required|string|max:255',
            'email'   => 'sometimes|required|email|max:255',
            'filiere' => 'sometimes|nullable|string|max:255',
            'niveau'  => 'sometimes|nullable|string|max:255',
            'password'=> 'sometimes|nullable|string|min:6',
        ]);

        // Si l'admin modifie, on synchronise aussi les infos dans la table users
        if (Auth::user() && Auth::user()->role === 'admin' && $etudiant->user) {
            $user = $etudiant->user;

            if (isset($data['nom']) || isset($data['prenom'])) {
                $userNom   = $data['nom']   ?? $etudiant->nom;
                $userPrenom= $data['prenom']?? $etudiant->prenom;
                $user->nom = $userNom . ' ' . $userPrenom;
            }

            if (isset($data['email'])) {
                $request->validate([
                    'email' => 'email|max:255|unique:users,email,' . $user->id,
                ]);
                $user->email = $data['email'];
            }

            if (!empty($data['password'])) {
                $user->password = $data['password']; // hash via cast
            }

            $user->save();
        }

        // Mise à jour des champs côté étudiant
        $etudiant->update($data);
        return response()->json($etudiant);
    }

    /**
     * Supprimer un étudiant
     */
    public function destroy(string $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        // Supprimer aussi l'utilisateur lié pour éviter les comptes orphelins
        if ($etudiant->user) {
            $etudiant->user->delete();
        } else {
            $etudiant->delete();
        }
        return response()->json(['message' => 'Étudiant supprimé']);
    }
}
