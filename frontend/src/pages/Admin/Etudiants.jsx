import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { etudiantsAPI, professeursAPI, encadrementAPI } from '../../services/api';
import { Plus, Edit, Trash2, Search, User, Building, Calendar, MapPin } from 'lucide-react';

const Etudiants = () => {
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEtudiant, setAssignEtudiant] = useState(null);
  const [professeurs, setProfesseurs] = useState([]);
  const [assignData, setAssignData] = useState({
    encadrant_id: '',
    rapporteur_id: '',
  });
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    filiere: '',
    niveau: '',
    sujet_stage: '',
    entreprise: '',
    domaine_stage: '',
    duree_stage: '',
    contact_etudiant: '',
  });

  useEffect(() => {
    fetchEtudiants();
    fetchProfesseurs();
  }, []);

  const fetchEtudiants = async () => {
    try {
      const response = await etudiantsAPI.getAll();
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesseurs = async () => {
    try {
      const response = await professeursAPI.getAll();
      setProfesseurs(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
      setProfesseurs([]);
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
      sujet_stage: etudiant.sujet_stage || '',
      entreprise: etudiant.entreprise || '',
      domaine_stage: etudiant.domaine_stage || '',
      duree_stage: etudiant.duree_stage || '',
      contact_etudiant: etudiant.contact_etudiant || '',
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

  const openAssignModal = (etudiant) => {
    setAssignEtudiant(etudiant);
    setAssignData({
      encadrant_id: etudiant.encadrant_id || '',
      rapporteur_id: etudiant.rapporteur_id || '',
    });
    setShowAssignModal(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    try {
      if (assignData.encadrant_id) {
        await encadrementAPI.affecterEncadrant(assignEtudiant.id, { encadrant_id: assignData.encadrant_id });
      }
      if (assignData.rapporteur_id) {
        await professeursAPI.affecterRapporteur(assignEtudiant.id, { rapporteur_id: assignData.rapporteur_id });
      }
      setShowAssignModal(false);
      setAssignEtudiant(null);
      fetchEtudiants();
      alert('Affectations enregistrées avec succès');
    } catch (error) {
      alert('Erreur lors de l\'affectation: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      filiere: '',
      niveau: '',
      sujet_stage: '',
      entreprise: '',
      domaine_stage: '',
      duree_stage: '',
      contact_etudiant: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredEtudiants = etudiants.filter(
    (etudiant) =>
      etudiant.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.filiere?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Étudiants</h1>
        <button
          onClick={() => navigate('/admin/etudiants/ajouter')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un étudiant</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filière / Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Affectations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEtudiants.map((etudiant) => (
              <tr key={etudiant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <button
                        type="button"
                        onClick={() => openAssignModal(etudiant)}
                        className="text-sm font-medium text-green-700 hover:text-green-900 underline-offset-2 hover:underline"
                        title="Affecter encadrant/rapporteur"
                      >
                        {etudiant.nom} {etudiant.prenom}
                      </button>
                      <div className="text-xs text-gray-500">{etudiant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{etudiant.filiere || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{etudiant.niveau || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-900">
                      {etudiant.entreprise || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-900">
                      {etudiant.duree_stage || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>
                      Encadrant: <span className="font-medium">{etudiant.encadrant?.user?.nom || 'Non affecté'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Rapporteur: <span className="font-medium">{etudiant.rapporteur?.user?.nom || 'Non affecté'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(etudiant)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openAssignModal(etudiant)}
                    className="text-green-600 hover:text-green-900"
                    title="Affecter encadrant/rapporteur"
                  >
                    Affecter
                  </button>
                  <button
                    onClick={() => handleDelete(etudiant.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Affecter Encadrant / Rapporteur</h2>
            <form onSubmit={submitAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encadrant</label>
                <select
                  value={assignData.encadrant_id}
                  onChange={(e) => setAssignData({ ...assignData, encadrant_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un encadrant</option>
                  {professeurs.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.user?.nom} - {prof.specialite}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rapporteur</label>
                <select
                  value={assignData.rapporteur_id}
                  onChange={(e) => setAssignData({ ...assignData, rapporteur_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un rapporteur</option>
                  {professeurs.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.user?.nom} - {prof.specialite}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filière *</label>
                  <input
                    type="text"
                    value={formData.filiere}
                    onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
                  <select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="M1">Master 1</option>
                    <option value="M2">Master 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet du stage</label>
                <input
                  type="text"
                  value={formData.sujet_stage}
                  onChange={(e) => setFormData({ ...formData, sujet_stage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domaine du stage</label>
                  <input
                    type="text"
                    value={formData.domaine_stage}
                    onChange={(e) => setFormData({ ...formData, domaine_stage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée du stage *</label>
                  <input
                    type="text"
                    value={formData.duree_stage}
                    onChange={(e) => setFormData({ ...formData, duree_stage: e.target.value })}
                    required
                    placeholder="Ex: 3 mois, 6 semaines..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact étudiant</label>
                  <input
                    type="tel"
                    value={formData.contact_etudiant}
                    onChange={(e) => setFormData({ ...formData, contact_etudiant: e.target.value })}
                    placeholder="Numéro de téléphone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
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
