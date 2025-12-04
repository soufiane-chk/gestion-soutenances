<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nom' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin'
        ]);

        User::create([
            'nom' => 'Etudiant 1',
            'email' => 'etudiant@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'etudiant'
        ]);

        User::create([
            'nom' => 'Enseignant 1',
            'email' => 'enseignant@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'professeur'
        ]);
    }
}
