import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { UserPlus, GraduationCap, Users, UserCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'etudiant',
    // Champs spécifiques selon le rôle
    filiere: '',
    niveau: '',
    specialite: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      };

      // Ajouter les champs spécifiques selon le rôle
      if (formData.role === 'etudiant') {
        dataToSend.filiere = formData.filiere;
        dataToSend.niveau = formData.niveau;
      } else if (formData.role === 'professeur') {
        dataToSend.specialite = formData.specialite;
      }

      console.log('Données envoyées:', dataToSend);
      
      // S'assurer que le token CSRF est initialisé
      await authAPI.initializeCsrfToken();
      
      const response = await authAPI.register(dataToSend);
      console.log('Réponse du serveur:', response);
      
      // Rediriger vers la page de login après inscription réussie
      navigate('/login', { 
        state: { message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' } 
      });
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse erreur:', error.response);
      
      // Afficher les erreurs de validation détaillées
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages || 'Erreur de validation');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('Route API non trouvée. Vérifiez que la route /api/register existe dans le backend.');
      } else if (error.response?.status === 500) {
        setError('Erreur serveur. Vérifiez les logs du backend.');
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Impossible de se connecter au serveur. Vérifiez que le backend Laravel est démarré sur http://localhost:8000');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Erreur lors de la création du compte. Vérifiez que le backend est démarré et que la route /api/register existe.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'etudiant', label: 'Étudiant', icon: GraduationCap, description: 'Pour les étudiants qui soumettent leurs projets' },
    { value: 'professeur', label: 'Professeur', icon: Users, description: 'Pour les professeurs qui encadrent et évaluent' },
    { value: 'jury', label: 'Jury', icon: UserCheck, description: 'Pour les membres du jury' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <UserPlus className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Créer un compte
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Choisissez votre rôle pour continuer
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Sélection du rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Je suis un(e) :
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`p-4 border-2 rounded-lg transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="font-semibold text-gray-800">{role.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{role.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Champs communs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* Champs spécifiques selon le rôle */}
          {formData.role === 'etudiant' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filière
                </label>
                <input
                  type="text"
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Informatique, Génie Civil..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <input
                  type="text"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: L3, M1, M2..."
                />
              </div>
            </>
          )}

          {formData.role === 'professeur' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité
              </label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Intelligence Artificielle, Base de données..."
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

