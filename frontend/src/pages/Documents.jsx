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
    }
  }, [isAdmin]);

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
          <h2 className="text-xl font-semibold mb-4">Documents requis</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Document de stage</span>
            </li>
            <li className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Convention de stage</span>
            </li>
            <li className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Assurance avec l'entreprise</span>
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((etudiant) => (
                <tr key={etudiant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {etudiant.nom} {etudiant.prenom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(etudiant.validation_documents)}`}>
                      {etudiant.validation_documents}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleDownload(etudiant.id, 'document_stage')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Télécharger document de stage"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(etudiant.id, 'convention')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Télécharger convention"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(etudiant.id, 'assurance')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Télécharger assurance"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setValidationData({ validation: 'valide', raison_rejet: '' });
                        handleValidation(etudiant.id);
                      }}
                      className="text-green-600 hover:text-green-900"
                      title="Valider"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const raison = prompt('Raison du rejet:');
                        if (raison) {
                          setValidationData({ validation: 'rejete', raison_rejet: raison });
                          handleValidation(etudiant.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Rejeter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

export default Documents;

