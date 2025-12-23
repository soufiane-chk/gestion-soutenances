import { useState, useEffect } from 'react';
import { rapporteurAPI, professeursAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, MessageSquare } from 'lucide-react';

const Rapporteur = () => {
  const { user, isProfesseur } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRemarquesModal, setShowRemarquesModal] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [remarques, setRemarques] = useState('');

  useEffect(() => {
    if (isProfesseur) {
      fetchRapports();
    }
  }, [isProfesseur]);

  const fetchRapports = async () => {
    try {
      const response = await professeursAPI.rapportsAEvaluer();
      setRapports(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterRemarques = (rapport) => {
    setSelectedRapport(rapport);
    setRemarques(rapport.rapports?.[0]?.remarque || '');
    setShowRemarquesModal(true);
  };

  const handleSubmitRemarques = async (e) => {
    e.preventDefault();
    if (!selectedRapport || !remarques.trim()) {
      alert('Veuillez saisir des remarques');
      return;
    }

    try {
      const rapportId = selectedRapport.rapports?.[0]?.id;
      if (!rapportId) {
        alert('Rapport non trouvé');
        return;
      }

      await rapporteurAPI.ajouterRemarques(rapportId, { remarque: remarques });
      alert('Remarques ajoutées avec succès');
      setShowRemarquesModal(false);
      setSelectedRapport(null);
      setRemarques('');
      fetchRapports();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleValider = async (rapport) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider ce rapport ?')) {
      return;
    }

    try {
      const rapportId = rapport.rapports?.[0]?.id;
      if (!rapportId) {
        alert('Rapport non trouvé');
        return;
      }

      await rapporteurAPI.validerRapport(rapportId);
      alert('Rapport validé avec succès');
      fetchRapports();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!isProfesseur) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Rapports à Évaluer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rapports.map((etudiant) => {
          const rapport = etudiant.rapports?.[0];
          if (!rapport) return null;

          return (
            <div key={etudiant.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {etudiant.nom} {etudiant.prenom}
                </h3>
                <p className="text-gray-600">{etudiant.email}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Rapport</span>
                </div>
                <p className="text-sm text-gray-600">
                  Statut: <span className={`px-2 py-1 rounded-full text-xs ${
                    rapport.statut === 'valide' ? 'bg-green-100 text-green-800' :
                    rapport.statut === 'corrige' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rapport.statut}
                  </span>
                </p>
                {rapport.remarque && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Remarques:</strong> {rapport.remarque}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleAjouterRemarques(etudiant)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ajouter remarques</span>
                </button>
                {rapport.statut !== 'valide' && (
                  <button
                    onClick={() => handleValider(etudiant)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Valider</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showRemarquesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Ajouter des remarques</h2>
            <form onSubmit={handleSubmitRemarques} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarques</label>
                <textarea
                  value={remarques}
                  onChange={(e) => setRemarques(e.target.value)}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Indiquez vos remarques sur le rapport..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRemarquesModal(false);
                    setSelectedRapport(null);
                    setRemarques('');
                  }}
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
};

export default Rapporteur;

