<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model {
    protected $fillable = [
        'user_id', 'nom', 'prenom', 'email', 'filiere', 'niveau',
        'sujet_stage', 'entreprise', 'domaine_stage', 'duree_stage', 'contact_etudiant',
        'document_stage', 'convention', 'assurance', 'validation_documents', 'raison_rejet_documents',
        'encadrant_id', 'rapporteur_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function rapports() {
        return $this->hasMany(Rapport::class);
    }

    public function soutenance() {
        return $this->hasOne(Soutenance::class, 'id_etudiant');
    }

    public function encadrant() {
        return $this->belongsTo(Professeur::class, 'encadrant_id');
    }

    public function rapporteur() {
        return $this->belongsTo(Professeur::class, 'rapporteur_id');
    }

    public function seancesEncadrement() {
        return $this->hasMany(SeanceEncadrement::class, 'etudiant_id');
    }

    public static function findEtudiantById($id) {
        $etudiant = self::find($id);
        if (!$etudiant) {
            // On ne retourne pas directement une réponse HTTP dans le modèle
            // On retourne null, le contrôleur gère la réponse
            return null;
        }
        return $etudiant;
    }
}
