<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professeur extends Model {
    protected $fillable = ['user_id', 'specialite'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function etudiantsEncadres() {
        return $this->hasMany(Etudiant::class, 'encadrant_id');
    }

    public function etudiantsRapporteurs() {
        return $this->hasMany(Etudiant::class, 'rapporteur_id');
    }

    public function seancesEncadrement() {
        return $this->hasMany(SeanceEncadrement::class, 'encadrant_id');
    }

    public function juriesEncadrant() {
        return $this->hasMany(Jury::class, 'encadrant_id');
    }

    public function juriesRapporteur() {
        return $this->hasMany(Jury::class, 'rapporteur_id');
    }

    public function juriesExaminateur() {
        return $this->hasMany(Jury::class, 'examinateur_id');
    }

    public function juriesPresident() {
        return $this->hasMany(Jury::class, 'president_id');
    }
}
