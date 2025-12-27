import { useState, useEffect } from 'react';
import { jurysAPI, soutenancesAPI, professeursAPI } from '../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const Jurys = () => {
  const [jurys, setJurys] = useState([]);
  const [soutenances, setSoutenances] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    soutenance_id: '',
    encadrant_id: '',
    rapporteur_id: '',
    examinateur_id: '',
    president_id: '',
  });

  useEffect(() => {
    fetchJurys();
    fetchSoutenances();
    fetchProfesseurs();
  }, []);

  const fetchJurys = async () => {
    try {
      const response = await jurysAPI.getAll();
      setJurys(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des jurys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSoutenances = async () => {
    try {
      const response = await soutenancesAPI.getAll();
      setSoutenances(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soutenances:', error);
    }
  };

  const fetchProfesseurs = async () => {
    try {
      const response = await professeursAPI.getAll();
      setProfesseurs(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await jurysAPI.update(editingId, formData);
      } else {
        await jurysAPI.create(formData);
      }
      fetchJurys();
      resetForm();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (jury) => {
    setEditingId(jury.id);
    setFormData({
      soutenance_id: jury.soutenance_id || '',
      encadrant_id: jury.encadrant_id || '',
      rapporteur_id: jury.rapporteur_id || '',
      examinateur_id: jury.examinateur_id || '',
      president_id: jury.president_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce jury ?')) {
      try {
        await jurysAPI.delete(id);
        fetchJurys();
      } catch (error) {
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      soutenance_id: '',
      encadrant_id: '',
      rapporteur_id: '',
      examinateur_id: '',
      president_id: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredJurys = jurys.filter(
    (jury) =>
      jury.soutenance?.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jury.soutenance?.theme?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Jurys</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un jury</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un jury..."
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
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Président
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Examinateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJurys.map((jury) => (
              <tr key={jury.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {jury.soutenance?.etudiant?.nom} {jury.soutenance?.etudiant?.prenom}
                  <div className="text-xs text-gray-500">{jury.soutenance?.theme}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {jury.soutenance?.date_soutenance ? new Date(jury.soutenance.date_soutenance).toLocaleDateString() : '-'}
                  <div className="text-xs text-gray-500">{jury.soutenance?.heure_soutenance}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {jury.president?.user?.nom || jury.president?.nom || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {jury.examinateur?.user?.nom || jury.examinateur?.nom || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(jury)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(jury.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Modifier le jury' : 'Ajouter un jury'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soutenance</label>
                <select
                  value={formData.soutenance_id}
                  onChange={(e) => setFormData({ ...formData, soutenance_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une soutenance</option>
                  {soutenances.map((soutenance) => (
                    <option key={soutenance.id} value={soutenance.id}>
                      {soutenance.theme} - {soutenance.etudiant?.nom} {soutenance.etudiant?.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encadrant</label>
                <div className="px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">
                  {professeurs.find(p => p.id === formData.encadrant_id)?.user?.nom || 'Non assigné'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examinateur</label>
                <select
                  value={formData.examinateur_id}
                  onChange={(e) => setFormData({ ...formData, examinateur_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un professeur</option>
                  {professeurs.map((professeur) => (
                    <option key={professeur.id} value={professeur.id}>
                      {professeur.user?.nom || professeur.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Président</label>
                <select
                  value={formData.president_id}
                  onChange={(e) => setFormData({ ...formData, president_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un professeur</option>
                  {professeurs.map((professeur) => (
                    <option key={professeur.id} value={professeur.id}>
                      {professeur.user?.nom || professeur.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4">
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

export default Jurys;



