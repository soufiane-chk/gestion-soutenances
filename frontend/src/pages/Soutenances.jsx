import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { soutenancesAPI, etudiantsAPI, professeursAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Soutenances = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [soutenances, setSoutenances] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_etudiant: '',
    date_soutenance: '',
    heure_soutenance: '',
    salle: '',
    status: '',
    encadrant_id: '',
    rapporteur_id: '',
    examinateur_id: '',
    president_id: '',
  });

  useEffect(() => {
    fetchSoutenances();
    if (user?.role !== 'etudiant') {
      fetchEtudiants();
      fetchProfesseurs();
    }
  }, [user]);

  const fetchSoutenances = async () => {
    try {
      const response = await soutenancesAPI.getAll();
      setSoutenances(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soutenances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEtudiants = async () => {
    try {
      const response = await etudiantsAPI.getAll();
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
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
        await soutenancesAPI.update(editingId, formData);
      } else {
        await soutenancesAPI.create(formData);
      }
      fetchSoutenances();
      resetForm();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (soutenance) => {
    setEditingId(soutenance.id);
    setFormData({
      id_etudiant: soutenance.id_etudiant || soutenance.etudiant_id || '',
      date_soutenance: soutenance.date_soutenance || '',
      heure_soutenance: soutenance.heure_soutenance || '',
      salle: soutenance.salle || '',
      status: soutenance.status || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette soutenance ?')) {
      try {
        await soutenancesAPI.delete(id);
        fetchSoutenances();
      } catch (error) {
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_etudiant: '',
      date_soutenance: '',
      heure_soutenance: '',
      salle: '',
      status: 'planifiee',
      encadrant_id: '',
      rapporteur_id: '',
      examinateur_id: '',
      president_id: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredSoutenances = user?.role === 'etudiant' 
    ? soutenances 
    : soutenances.filter(
        (soutenance) =>
          soutenance.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          soutenance.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          soutenance.salle?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const selectedStudent = etudiants.find(e => e.id == formData.id_etudiant);
  const recommendedProfs = selectedStudent 
    ? professeurs.filter(p => p.specialite === selectedStudent.filiere)
    : [];
  const otherProfs = selectedStudent
    ? professeurs.filter(p => p.specialite !== selectedStudent.filiere)
    : professeurs;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vue pour l'étudiant : affichage de sa soutenance en lecture seule
  if (user?.role === 'etudiant') {
    const maSoutenance = soutenances.find(s => s.etudiant?.user_id === user?.id);
    
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Ma Soutenance</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : maSoutenance ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Date de soutenance</h3>
                  <p className="text-gray-900">
                    {new Date(maSoutenance.date_soutenance).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {maSoutenance.heure_soutenance && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Heure</h3>
                    <p className="text-gray-900">{maSoutenance.heure_soutenance}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Lieu</h3>
                  <p className="text-gray-900">{maSoutenance.salle || 'Non spécifié'}</p>
                </div>
              </div>
              
              {maSoutenance.status && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 mt-1"></div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Statut</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      maSoutenance.status === 'planifiee' ? 'bg-green-100 text-green-800' :
                      maSoutenance.status === 'terminee' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {maSoutenance.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Composition du jury */}
            {maSoutenance.jury && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Composition du Jury
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {maSoutenance.jury.encadrant && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Encadrant</p>
                      <p className="font-medium text-gray-900">
                        {maSoutenance.jury.encadrant.user?.nom || 'Non assigné'}
                      </p>
                    </div>
                  )}
                  {maSoutenance.jury.rapporteur && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Rapporteur</p>
                      <p className="font-medium text-gray-900">
                        {maSoutenance.jury.rapporteur.user?.nom || 'Non assigné'}
                      </p>
                    </div>
                  )}
                  {maSoutenance.jury.examinateur && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Examinateur</p>
                      <p className="font-medium text-gray-900">
                        {maSoutenance.jury.examinateur.user?.nom || 'Non assigné'}
                      </p>
                    </div>
                  )}
                  {maSoutenance.jury.president && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Président</p>
                      <p className="font-medium text-gray-900">
                        {maSoutenance.jury.president.user?.nom || 'Non assigné'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Aucune soutenance n'a été planifiée pour le moment. Votre professeur vous informera dès qu'elle sera programmée.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Vue pour admin/professeur : gestion complète
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Soutenances</h1>
        <button
          onClick={() => navigate('/soutenances/ajouter')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter une soutenance</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une soutenance..."
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
                Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSoutenances.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Aucune soutenance trouvée
                </td>
              </tr>
            ) : (
              filteredSoutenances.map((soutenance) => (
                <tr key={soutenance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {soutenance.etudiant?.nom} {soutenance.etudiant?.prenom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {soutenance.date_soutenance ? new Date(soutenance.date_soutenance).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {soutenance.heure_soutenance || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {soutenance.salle || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/soutenances/modifier/${soutenance.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(soutenance.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Soutenances;



