<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etudiant;
use App\Models\User;

class EtudiantSeeder extends Seeder
{
    public function run(): void
    {
        // Récupère l'utilisateur 'Etudiant 1' créé dans UserSeeder
        $user = User::where('email', 'etudiant@gmail.com')->first();
        if ($user) {
            Etudiant::create([
                'user_id' => $user->id,
                'nom' => 'Chakir',
                'prenom' => 'Soufiane',
                'email' => 'soufiane@gmail.com',
                'filiere' => 'Développement Web',
                'niveau' => '2ème année',
            ]);
            Etudiant::create([
                'user_id' => $user->id,
                'nom' => 'El Amrani',
                'prenom' => 'Yassine',
                'email' => 'yassine@gmail.com',
                'filiere' => 'Réseaux',
                'niveau' => '1ère année',
            ]);
        }
    }
}
