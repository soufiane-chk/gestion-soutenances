<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model {
    protected $fillable = ['etudiant_id','fichier','remarque','statut','date_depot','raison_non_validation','date_soutenance','lieu_soutenance'];

    public function etudiant() {
        return $this->belongsTo(Etudiant::class);
    }
}
