import { useState, useEffect } from 'react';
import { encadrementAPI, professeursAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Calendar, Clock, FileText, Users } from 'lucide-react';

const Encadrement = () => {
  const { user, isAdmin, isProfesseur } = useAuth();
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [showSeanceModal, setShowSeanceModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    encadrant_id: '',
    etudiant_id: '',
    date_seance: '',
    heure_debut: '',
    duree_minutes: 30,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const [etudiantsRes, profsRes] = await Promise.all([
          encadrementAPI.mesEtudiants().catch(() => ({ data: [] })),
          professeursAPI.getAll().catch(() => ({ data: [] })),
        ]);
        setEtudiants(etudiantsRes.data || []);
        setProfesseurs(profsRes.data || []);
      } else if (isProfesseur) {
        const [etudiantsRes, seancesRes] = await Promise.all([
          encadrementAPI.mesEtudiants().catch(() => ({ data: [] })),
          encadrementAPI.mesSeances().catch(() => ({ data: [] })),
        ]);
        setEtudiants(etudiantsRes.data || []);
        setSeances(seancesRes.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAffecter = async (etudiantId) => {
    setSelectedEtudiant(etudiantId);
    setShowAffectModal(true);
  };

  const handleSubmitAffectation = async (e) => {
    e.preventDefault();
    try {
      await encadrementAPI.affecterEncadrant(selectedEtudiant, {
        encadrant_id: formData.encadrant_id,
      });
      alert('Encadrant affecté avec succès');
      setShowAffectModal(false);
      setFormData({ ...formData, encadrant_id: '' });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreerSeance = (etudiantId) => {
    setFormData({ ...formData, etudiant_id: etudiantId });
    setShowSeanceModal(true);
  };

  const handleSubmitSeance = async (e) => {
    e.preventDefault();
    try {
      await encadrementAPI.creerSeance(formData);
      alert('Séance créée avec succès');
      setShowSeanceModal(false);
      setFormData({
        encadrant_id: '',
        etudiant_id: '',
        date_seance: '',
        heure_debut: '',
        duree_minutes: 30,
        notes: '',
      });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Affectation des Encadrants</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Encadrant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {etudiants.map((etudiant) => (
                <tr key={etudiant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {etudiant.nom} {etudiant.prenom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{etudiant.domaine_stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {etudiant.encadrant?.user?.nom || 'Non affecté'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAffecter(etudiant.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAffectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Affecter un encadrant</h2>
              <form onSubmit={handleSubmitAffectation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Encadrant</label>
                  <select
                    value={formData.encadrant_id}
                    onChange={(e) => setFormData({ ...formData, encadrant_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner un encadrant</option>
                    {professeurs.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.user?.nom} - {prof.specialite}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Affecter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAffectModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isProfesseur) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mes Étudiants Encadrés</h1>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold">{etudiants.length} étudiant(s)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {etudiants.map((etudiant) => (
            <div key={etudiant.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {etudiant.nom} {etudiant.prenom}
                  </h3>
                  <p className="text-gray-600">{etudiant.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Contact: {etudiant.contact_etudiant}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm"><strong>Sujet:</strong> {etudiant.sujet_stage}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm"><strong>Entreprise:</strong> {etudiant.entreprise}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm"><strong>Durée:</strong> {etudiant.duree_stage} semaines</span>
                </div>
              </div>
              <button
                onClick={() => handleCreerSeance(etudiant.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Créer une séance
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Mes Séances d'Encadrement</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seances.map((seance) => (
                  <tr key={seance.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seance.etudiant?.nom} {seance.etudiant?.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{seance.date_seance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seance.heure_debut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seance.duree_minutes} min</td>
                    <td className="px-6 py-4">{seance.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showSeanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Créer une séance d'encadrement</h2>
              <form onSubmit={handleSubmitSeance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date_seance}
                    onChange={(e) => setFormData({ ...formData, date_seance: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    min="30"
                    value={formData.duree_minutes}
                    onChange={(e) => setFormData({ ...formData, duree_minutes: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSeanceModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Encadrement;

