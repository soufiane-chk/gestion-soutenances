import { useState, useEffect } from 'react';
import { etudiantsAPI, professeursAPI, encadrementAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Etudiants = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    filiere: '',
    niveau: '',
    password: '',
  });
  const [showSeanceModal, setShowSeanceModal] = useState(false);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState(null);
  const [seanceData, setSeanceData] = useState({
    date_seance: '',
    heure_debut: '',
    duree_minutes: 30,
    notes: '',
  });
  const { isProfesseur } = useAuth();

  useEffect(() => {
    fetchEtudiants();
  }, []);

  const fetchEtudiants = async () => {
    try {
      const response = isProfesseur ? await professeursAPI.rapportsAEvaluer() : await etudiantsAPI.getAll();
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSeanceModal = (id) => {
    setSelectedEtudiantId(id);
    setShowSeanceModal(true);
  };

  const submitSeance = async (e) => {
    e.preventDefault();
    try {
      await encadrementAPI.creerSeance({
        etudiant_id: selectedEtudiantId,
        date_seance: seanceData.date_seance,
        heure_debut: seanceData.heure_debut,
        duree_minutes: Number(seanceData.duree_minutes),
        notes: seanceData.notes,
      });
      setShowSeanceModal(false);
      setSelectedEtudiantId(null);
      setSeanceData({
        date_seance: '',
        heure_debut: '',
        duree_minutes: 30,
        notes: '',
      });
      alert('Séance créée avec succès');
    } catch (error) {
      alert('Erreur lors de la création de la séance: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await etudiantsAPI.update(editingId, formData);
      } else {
        await etudiantsAPI.create(formData);
      }
      fetchEtudiants();
      resetForm();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (etudiant) => {
    setEditingId(etudiant.id);
    setFormData({
      nom: etudiant.nom || '',
      prenom: etudiant.prenom || '',
      email: etudiant.email || '',
      filiere: etudiant.filiere || '',
      niveau: etudiant.niveau || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await etudiantsAPI.delete(id);
        fetchEtudiants();
      } catch (error) {
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      filiere: '',
      niveau: '',
      password: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredEtudiants = etudiants.filter(
    (etudiant) =>
      etudiant.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">Gestion des Étudiants</h1>
          <p className="text-gray-600">Gérez les étudiants et leurs informations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un étudiant</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-effect border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
          />
        </div>
      </div>

      <div className="glass-effect rounded-2xl shadow-xl overflow-hidden border border-white/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Filière
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Niveau
                </th>
                {isProfesseur && (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Sujet de stage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Durée (semaines)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Contact
                    </th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEtudiants.map((etudiant, index) => (
                <tr 
                  key={etudiant.id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {etudiant.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {etudiant.prenom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {etudiant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {etudiant.filiere}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {etudiant.niveau}
                    </span>
                  </td>
                  {isProfesseur && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {etudiant.sujet_stage || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {etudiant.duree_stage ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {etudiant.contact_etudiant || '-'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(etudiant)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(etudiant.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {isProfesseur && (
                      <button
                        onClick={() => openSeanceModal(etudiant.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Planifier une séance"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold gradient-text mb-6">
              {editingId ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                <input
                  type="text"
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <input
                  type="text"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {editingId ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSeanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold gradient-text mb-6">Planifier une séance</h2>
            <form onSubmit={submitSeance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={seanceData.date_seance}
                  onChange={(e) => setSeanceData({ ...seanceData, date_seance: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                <input
                  type="time"
                  value={seanceData.heure_debut}
                  onChange={(e) => setSeanceData({ ...seanceData, heure_debut: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={seanceData.duree_minutes}
                  onChange={(e) => setSeanceData({ ...seanceData, duree_minutes: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={seanceData.notes}
                  onChange={(e) => setSeanceData({ ...seanceData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Planifier
                </button>
                <button
                  type="button"
                  onClick={() => setShowSeanceModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-all"
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
};

export default Etudiants;



