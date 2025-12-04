<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Professeur;

class ProfesseurSeeder extends Seeder
{
    public function run(): void
    {
        Professeur::create([
            'user_id' => 3,
            'specialite' => 'Bases de données'
        ]);
    }
}
