<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jury;

class JurySeeder extends Seeder
{
    public function run(): void
    {
        Jury::create([
            'soutenance_id' => 1,
            'encadrant_id' => 1,
            'rapporteur_id' => 1,
            'examinateur_id' => 1,
            'president_id' => 1
        ]);
    }
}
