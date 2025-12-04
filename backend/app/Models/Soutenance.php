<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soutenance extends Model {
    protected $fillable = ['id_etudiant','date_soutenance','heure_soutenance','salle','status'];

    public function etudiant() {
        return $this->belongsTo(Etudiant::class, 'id_etudiant');
    }

    public function jury() {
        return $this->hasOne(Jury::class);
    }
}
