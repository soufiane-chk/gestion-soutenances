<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Soutenance;
use App\Models\Etudiant;
use App\Models\Professeur;

class SoutenanceSeeder extends Seeder
{
    public function run(): void
    {
        $etudiant = Etudiant::first();
        $professeur = Professeur::first();

        if ($etudiant && $professeur) {
            Soutenance::create([
                'etudiant_id' => $etudiant->id,
                'enseignant_id' => $professeur->id,
                'theme' => 'Système de réservation en ligne',
                'date_soutenance' => '2025-06-20',
                'salle' => 'Salle 5',
            ]);
        }
    }
}
