import { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, Check, X, Download, FileText } from 'lucide-react';

const Documents = () => {
  const { user, isAdmin, isEtudiant } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    document_stage: null,
    convention: null,
    assurance: null,
  });
  const [validationData, setValidationData] = useState({
    validation: 'valide',
    raison_rejet: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchDocumentsEnAttente();
    } else if (isEtudiant) {
      fetchMesDocuments();
    }
  }, [isAdmin, isEtudiant]);

  const fetchDocumentsEnAttente = async () => {
    try {
      const response = await documentsAPI.enAttente();
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMesDocuments = async () => {
    try {
      const response = await documentsAPI.mesDocuments();
      setDocuments(response.data || {});
    } catch (error) {
      console.error('Erreur lors du chargement de mes documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEtudiant) return;

    try {
      const formDataToSend = new FormData();
      if (formData.document_stage) {
        formDataToSend.append('document_stage', formData.document_stage);
      }
      if (formData.convention) {
        formDataToSend.append('convention', formData.convention);
      }
      if (formData.assurance) {
        formDataToSend.append('assurance', formData.assurance);
      }
      console.log(user);
      await documentsAPI.deposer(user.id, formDataToSend);
      alert('Documents déposés avec succès');
      setShowModal(false);
      setFormData({ document_stage: null, convention: null, assurance: null });
      // Refresh the documents list
      fetchMesDocuments();
    } catch (error) {
      alert('Erreur lors du dépôt: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleValidation = async (etudiantId) => {
    try {
      await documentsAPI.valider(etudiantId, validationData);
      alert('Documents ' + validationData.validation);
      fetchDocumentsEnAttente();
      setValidationData({ validation: 'valide', raison_rejet: '' });
    } catch (error) {
      alert('Erreur lors de la validation: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = async (etudiantId, type) => {
    try {
      const response = await documentsAPI.download(etudiantId, type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erreur lors du téléchargement');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      valide: 'bg-green-100 text-green-800',
      rejete: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (isEtudiant) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dépôt de Documents</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-5 h-5" />
            <span>Déposer des documents</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {documents.validation_documents && (
            <div className={`mb-6 p-4 rounded-lg ${
              documents.validation_documents === 'valide' ? 'bg-green-100 border border-green-200 text-green-800' :
              documents.validation_documents === 'rejete' ? 'bg-red-100 border border-red-200 text-red-800' :
              'bg-yellow-100 border border-yellow-200 text-yellow-800'
            }`}>
              <h3 className="font-bold text-lg mb-2">
                Statut : {
                  documents.validation_documents === 'valide' ? 'Validé' :
                  documents.validation_documents === 'rejete' ? 'Rejeté' :
                  'En attente'
                }
              </h3>
              {documents.raison_rejet_documents && (
                <p>Raison du rejet : {documents.raison_rejet_documents}</p>
              )}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Documents requis</h2>
          <p className="text-gray-600 mb-4">Veuillez déposer tous les documents suivants :</p>
          <ul className="space-y-2">
            <li className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {documents.document_stage ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
                <span className={documents.document_stage ? 'text-green-600' : 'text-gray-700'}>
                  Document de stage {documents.document_stage && '(déposé)'}
                </span>
              </div>
              {documents.document_stage && (
                <button
                  onClick={() => handleDownload(user.id, 'document_stage')}
                  className="text-blue-600 hover:text-blue-900"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </li>
            <li className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {documents.convention ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
                <span className={documents.convention ? 'text-green-600' : 'text-gray-700'}>
                  Convention de stage {documents.convention && '(déposée)'}
                </span>
              </div>
              {documents.convention && (
                <button
                  onClick={() => handleDownload(user.id, 'convention')}
                  className="text-blue-600 hover:text-blue-900"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </li>
            <li className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {documents.assurance ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
                <span className={documents.assurance ? 'text-green-600' : 'text-gray-700'}>
                  Assurance avec l'entreprise {documents.assurance && '(déposée)'}
                </span>
              </div>
              {documents.assurance && (
                <button
                  onClick={() => handleDownload(user.id, 'assurance')}
                  className="text-blue-600 hover:text-blue-900"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </li>
          </ul>
        </div>



        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Déposer des documents</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document de stage
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('document_stage', e.target.files[0])}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Convention
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('convention', e.target.files[0])}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assurance
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('assurance', e.target.files[0])}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    Déposer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
  }

  if (isAdmin) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Validation des Documents</h1>

        <div className="space-y-6">
          {documents.map((etudiant) => (
            <div key={etudiant.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {etudiant.nom} {etudiant.prenom}
                  </h3>
                  <p className="text-sm text-gray-600">{etudiant.email}</p>
                  <p className="text-sm text-gray-600">
                    {etudiant.filiere} - {etudiant.niveau}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(etudiant.validation_documents)}`}>
                  {etudiant.validation_documents}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Document de stage</h4>
                    {etudiant.document_stage && (
                      <button
                        onClick={() => handleDownload(etudiant.id, 'document_stage')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center">
                    {etudiant.document_stage ? (
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm ${etudiant.document_stage ? 'text-green-600' : 'text-red-600'}`}>
                      {etudiant.document_stage ? 'Déposé' : 'Non déposé'}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Convention</h4>
                    {etudiant.convention && (
                      <button
                        onClick={() => handleDownload(etudiant.id, 'convention')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center">
                    {etudiant.convention ? (
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm ${etudiant.convention ? 'text-green-600' : 'text-red-600'}`}>
                      {etudiant.convention ? 'Déposée' : 'Non déposée'}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Assurance</h4>
                    {etudiant.assurance && (
                      <button
                        onClick={() => handleDownload(etudiant.id, 'assurance')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center">
                    {etudiant.assurance ? (
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm ${etudiant.assurance ? 'text-green-600' : 'text-red-600'}`}>
                      {etudiant.assurance ? 'Déposée' : 'Non déposée'}
                    </span>
                  </div>
                </div>
              </div>

              {etudiant.validation_documents === 'en_attente' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleValidation(etudiant.id, 'valide')}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider tous les documents</span>
                  </button>
                  <button
                    onClick={() => {
                      const raison = prompt('Raison du rejet:');
                      if (raison) {
                        handleValidation(etudiant.id, 'rejete', raison);
                      }
                    }}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default Documents;

