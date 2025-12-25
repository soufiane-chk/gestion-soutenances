import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { etudiantsAPI } from '../../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const AddEtudiant = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await etudiantsAPI.create(formData);
      alert('Étudiant ajouté avec succès');
      navigate('/admin/etudiants');
    } catch (error) {
      alert('Erreur lors de l\'ajout: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admin/etudiants')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à la liste</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Ajouter un Étudiant</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le prénom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez l'email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filière *</label>
              <input
                type="text"
                value={formData.filiere}
                onChange={(e) => handleChange('filiere', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez la filière"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
              <select
                value={formData.niveau}
                onChange={(e) => handleChange('niveau', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sujet du stage *</label>
            <input
              type="text"
              value={formData.sujet_stage}
              onChange={(e) => handleChange('sujet_stage', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le sujet du stage"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise *</label>
              <input
                type="text"
                value={formData.entreprise}
                onChange={(e) => handleChange('entreprise', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez l'entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domaine du stage</label>
              <input
                type="text"
                value={formData.domaine_stage}
                onChange={(e) => handleChange('domaine_stage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le domaine du stage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée du stage *</label>
              <input
                type="text"
                value={formData.duree_stage}
                onChange={(e) => handleChange('duree_stage', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 3 mois, 6 semaines..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact étudiant</label>
              <input
                type="tel"
                value={formData.contact_etudiant}
                onChange={(e) => handleChange('contact_etudiant', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Ajout en cours...' : 'Ajouter l\'étudiant'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/etudiants')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEtudiant;
