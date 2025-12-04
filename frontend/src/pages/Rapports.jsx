import { useState, useEffect } from 'react';
import { rapportsAPI, soutenancesAPI, etudiantsAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, Calendar, MapPin, FileText, User, GraduationCap, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Rapports = () => {
  const { user } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showNonValidationModal, setShowNonValidationModal] = useState(false);
  const [showSoutenanceModal, setShowSoutenanceModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [validatingRapportId, setValidatingRapportId] = useState(null);
  const [validatedRapport, setValidatedRapport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    etudiant_id: '',
    fichier: null,
    remarque: '',
    // statut stocké en base: 'depose' (en attente), 'corrige', 'valide'
    statut: 'depose',
    date_depot: new Date().toISOString().split('T')[0],
  });
  const [validationData, setValidationData] = useState({
    date_soutenance: '',
    lieu_soutenance: '',
  });
  const [nonValidationData, setNonValidationData] = useState({
    raison_non_validation: '',
  });
  const [soutenanceData, setSoutenanceData] = useState({
    id_etudiant: '',
    date_soutenance: '',
    heure_soutenance: '',
    salle: '',
    status: 'planifiee',
  });

  useEffect(() => {
    fetchRapports();
    if (user?.role === 'professeur') {
      fetchEtudiants();
    }
  }, [user]);

  const fetchEtudiants = async () => {
    try {
      const response = await etudiantsAPI.getAll();
      console.log('Étudiants chargés:', response.data);
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      alert('Erreur lors du chargement des étudiants: ' + (error.response?.data?.message || error.message));
    }
  };

  // Quand un étudiant est connecté, on lie automatiquement le rapport à son profil
  useEffect(() => {
    if (user?.role === 'etudiant' && user.etudiant?.id) {
      setFormData((prev) => ({
        ...prev,
        etudiant_id: user.etudiant.id,
      }));
    }
  }, [user]);

  const fetchRapports = async () => {
    try {
      const response = await rapportsAPI.getAll();
      setRapports(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('etudiant_id', formData.etudiant_id);
      data.append('remarque', formData.remarque);
      data.append('statut', formData.statut);
      data.append('date_depot', formData.date_depot);
      if (formData.fichier) {
        data.append('fichier', formData.fichier);
      }

      if (editingId) {
        await rapportsAPI.update(editingId, data);
      } else {
        await rapportsAPI.create(data);
      }
      fetchRapports();
      resetForm();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (rapport) => {
    setEditingId(rapport.id);
    setFormData({
      etudiant_id: rapport.etudiant_id || '',
      fichier: null,
      remarque: rapport.remarque || '',
      statut: rapport.statut || 'depose',
      date_depot: rapport.date_depot || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await rapportsAPI.delete(id);
        fetchRapports();
      } catch (error) {
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData((prev) => ({
      etudiant_id: prev.etudiant_id, // on garde l'étudiant actuel (étudiant connecté)
      fichier: null,
      remarque: '',
      statut: 'depose',
      date_depot: new Date().toISOString().split('T')[0],
    }));
    setEditingId(null);
    setShowModal(false);
  };

  const handleValidate = (rapportId) => {
    setValidatingRapportId(rapportId);
    setValidationData({
      date_soutenance: '',
      lieu_soutenance: '',
    });
    setShowValidationModal(true);
  };

  const handleNonValidate = (rapportId) => {
    setValidatingRapportId(rapportId);
    setNonValidationData({
      raison_non_validation: '',
    });
    setShowNonValidationModal(true);
  };

  const submitValidation = async () => {
    try {
      const data = new FormData();
      data.append('statut', 'valide');
      await rapportsAPI.update(validatingRapportId, data);
      
      // Récupérer le rapport validé pour créer la soutenance
      const response = await rapportsAPI.getById(validatingRapportId);
      const rapport = response.data;
      
      setValidatedRapport(rapport);
      setSoutenanceData({
        id_etudiant: rapport.etudiant_id || '',
        date_soutenance: '',
        heure_soutenance: '',
        salle: '',
        status: 'planifiee',
      });
      
      setShowValidationModal(false);
      setShowSoutenanceModal(true);
      setValidatingRapportId(null);
      fetchRapports();
    } catch (error) {
      alert('Erreur lors de la validation: ' + (error.response?.data?.message || error.message));
    }
  };

  const submitSoutenance = async (e) => {
    e.preventDefault();
    try {
      await soutenancesAPI.create(soutenanceData);
      fetchRapports();
      setShowSoutenanceModal(false);
      setValidatedRapport(null);
      setSoutenanceData({
        id_etudiant: '',
        date_soutenance: '',
        heure_soutenance: '',
        salle: '',
        status: 'planifiee',
      });
      alert('Soutenance créée avec succès !');
    } catch (error) {
      alert('Erreur lors de la création de la soutenance: ' + (error.response?.data?.message || error.message));
    }
  };

  const submitNonValidation = async (e) => {
    e.preventDefault();
    if (!nonValidationData.raison_non_validation.trim()) {
      alert('Veuillez indiquer la raison de la non-validation');
      return;
    }
    try {
      const data = new FormData();
      data.append('statut', 'non_valide');
      data.append('raison_non_validation', nonValidationData.raison_non_validation);
      await rapportsAPI.update(validatingRapportId, data);
      fetchRapports();
      setShowNonValidationModal(false);
      setValidatingRapportId(null);
      setNonValidationData({ raison_non_validation: '' });
    } catch (error) {
      alert('Erreur lors de la non-validation: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'valide':
        return 'bg-green-100 text-green-800';
      case 'non_valide':
        return 'bg-red-100 text-red-800';
      case 'corrige':
        return 'bg-yellow-100 text-yellow-800';
      // 'depose' = en attente
      case 'depose':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'valide':
        return 'Validé';
      case 'non_valide':
        return 'Non validé';
      case 'corrige':
        return 'Corrigé';
      case 'depose':
      default:
        return 'Déposé';
    }
  };

  const filteredRapports = rapports.filter(
    (rapport) =>
      rapport.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.fichier?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Rapports</h1>
        {user?.role === 'etudiant' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Déposer un rapport</span>
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un rapport..."
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
              {user?.role === 'professeur' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filière / Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de dépôt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fichier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de dépôt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRapports.map((rapport) => (
              <tr key={rapport.id} className="hover:bg-gray-50">
                {user?.role === 'professeur' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {rapport.etudiant?.nom} {rapport.etudiant?.prenom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          <div>{rapport.etudiant?.filiere || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{rapport.etudiant?.niveau || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rapport.fichier ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/rapports/${rapport.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Télécharger</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Aucun fichier</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rapport.date_depot ? new Date(rapport.date_depot).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(rapport.statut || 'depose')}`}>
                        {getStatutLabel(rapport.statut || 'depose')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {rapport.statut === 'valide' ? (
                        <span className="text-green-600 text-sm font-semibold">Validé</span>
                      ) : rapport.statut === 'non_valide' ? (
                        <button
                          onClick={() => handleValidate(rapport.id)}
                          className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          title="Valider"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-xs">Valider</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleValidate(rapport.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            title="Valider"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-xs">Valider</span>
                          </button>
                          <button
                            onClick={() => handleNonValidate(rapport.id)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            title="Non valider"
                          >
                            <XCircle className="w-5 h-5" />
                            <span className="text-xs">Non valider</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rapport.etudiant?.nom} {rapport.etudiant?.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href={rapport.fichier_url || rapport.fichier}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>Voir le rapport</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rapport.date_depot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(rapport.statut || 'depose')}`}>
                        {getStatutLabel(rapport.statut || 'depose')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {rapport.statut === 'non_valide' && rapport.raison_non_validation && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            <strong>Raison:</strong> {rapport.raison_non_validation}
                          </div>
                        )}
                        {rapport.statut === 'valide' && (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded space-y-1">
                            {rapport.date_soutenance && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span><strong>Date:</strong> {new Date(rapport.date_soutenance).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                            {rapport.lieu_soutenance && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span><strong>Lieu:</strong> {rapport.lieu_soutenance}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Actions pour l'étudiant sur SES propres rapports */}
                      {user?.role === 'etudiant' && user.etudiant?.id === rapport.etudiant_id && (
                        <>
                          <button
                            onClick={() => handleEdit(rapport)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rapport.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Suppression globale par l'admin */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(rapport.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && user?.role === 'etudiant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Modifier le rapport' : 'Ajouter un rapport'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, fichier: e.target.files[0] })}
                    required={!editingId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarque</label>
                <textarea
                  value={formData.remarque}
                  onChange={(e) => setFormData({ ...formData, remarque: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {/* Le statut est géré automatiquement côté backend (en_attente par défaut),
                  l'étudiant ne choisit pas le statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de dépôt</label>
                <input
                  type="date"
                  value={formData.date_depot}
                  onChange={(e) => setFormData({ ...formData, date_depot: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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

      {/* Modal de validation pour le professeur */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Valider le rapport</h2>
            <p className="text-gray-600 mb-4">Êtes-vous sûr de vouloir valider ce rapport ? Vous pourrez ensuite créer la soutenance.</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={submitValidation}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowValidationModal(false);
                  setValidatingRapportId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de soutenance après validation */}
      {showSoutenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Créer la soutenance</h2>
            <form onSubmit={submitSoutenance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étudiant <span className="text-red-500">*</span>
                </label>
                <select
                  value={soutenanceData.id_etudiant}
                  onChange={(e) => setSoutenanceData({ ...soutenanceData, id_etudiant: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un étudiant</option>
                  {etudiants.length === 0 ? (
                    <option value="" disabled>Aucun étudiant disponible</option>
                  ) : (
                    etudiants.map((etudiant) => (
                      <option key={etudiant.id} value={etudiant.id}>
                        {etudiant.nom} {etudiant.prenom} - {etudiant.filiere} ({etudiant.niveau})
                      </option>
                    ))
                  )}
                </select>
                {etudiants.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Aucun étudiant trouvé. Veuillez vérifier que des étudiants sont enregistrés dans le système.
                  </p>
                )}
                {validatedRapport && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rapport validé pour : <strong>{validatedRapport.etudiant?.nom} {validatedRapport.etudiant?.prenom}</strong>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de soutenance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={soutenanceData.date_soutenance}
                  onChange={(e) => setSoutenanceData({ ...soutenanceData, date_soutenance: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de soutenance <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={soutenanceData.heure_soutenance}
                  onChange={(e) => setSoutenanceData({ ...soutenanceData, heure_soutenance: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salle / Lieu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soutenanceData.salle}
                  onChange={(e) => setSoutenanceData({ ...soutenanceData, salle: e.target.value })}
                  required
                  placeholder="Ex: Salle A101, Amphi 2..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Créer la soutenance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSoutenanceModal(false);
                    setValidatedRapport(null);
                    setSoutenanceData({
                      id_etudiant: '',
                      date_soutenance: '',
                      heure_soutenance: '',
                      salle: '',
                      status: 'planifiee',
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de non-validation pour le professeur */}
      {showNonValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Non valider le rapport</h2>
            <p className="text-gray-600 mb-4">Veuillez indiquer la raison de la non-validation. L'étudiant pourra voir cette raison.</p>
            <form onSubmit={submitNonValidation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison de la non-validation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={nonValidationData.raison_non_validation}
                  onChange={(e) => setNonValidationData({ ...nonValidationData, raison_non_validation: e.target.value })}
                  required
                  placeholder="Ex: Le rapport nécessite des corrections majeures..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Non valider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNonValidationModal(false);
                    setValidatingRapportId(null);
                    setNonValidationData({ raison_non_validation: '' });
                  }}
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

export default Rapports;



