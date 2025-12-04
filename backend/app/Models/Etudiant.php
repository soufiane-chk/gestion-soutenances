<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model {
    protected $fillable = ['user_id','nom','prenom','email','filiere','niveau'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function rapports() {
        return $this->hasMany(Rapport::class);
    }

    public function soutenance() {
        return $this->hasOne(Soutenance::class, 'id_etudiant');
    }
}
