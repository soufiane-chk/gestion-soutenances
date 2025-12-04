<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rapport;

class RapportSeeder extends Seeder
{
    public function run(): void
    {
        Rapport::create([
            'etudiant_id' => 1,
            'fichier' => 'rapport_pfe.pdf',
            'remarque' => 'Bon travail',
            'statut' => 'valide',
            'date_depot' => now()
        ]);
    }
}
