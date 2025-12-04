<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jury extends Model {
    protected $fillable = [
        'soutenance_id',
        'encadrant_id',
        'rapporteur_id',
        'examinateur_id',
        'president_id'
    ];

    public function soutenance() {
        return $this->belongsTo(Soutenance::class);
    }

    public function encadrant() {
        return $this->belongsTo(Professeur::class, 'encadrant_id');
    }

    public function rapporteur() {
        return $this->belongsTo(Professeur::class, 'rapporteur_id');
    }

    public function examinateur() {
        return $this->belongsTo(Professeur::class, 'examinateur_id');
    }

    public function president() {
        return $this->belongsTo(Professeur::class, 'president_id');
    }
}

