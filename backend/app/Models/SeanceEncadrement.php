<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeanceEncadrement extends Model {
    protected $fillable = [
        'encadrant_id', 'etudiant_id', 'date_seance', 
        'heure_debut', 'heure_fin', 'duree_minutes', 'notes'
    ];

    protected $casts = [
        'date_seance' => 'date',
        'heure_debut' => 'datetime',
        'heure_fin' => 'datetime',
    ];

    public function encadrant() {
        return $this->belongsTo(Professeur::class, 'encadrant_id');
    }

    public function etudiant() {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }
}

