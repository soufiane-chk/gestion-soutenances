import { useState, useEffect } from 'react';
import { etudiantsAPI, professeursAPI, jurysAPI } from '../../services/api';
import { Edit, Trash2, Search, Shield, User, GraduationCap, UserCheck } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: 'etudiant',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all users from different entities
      const [etudiantsRes, professeursRes, jurysRes] = await Promise.all([
        etudiantsAPI.getAll(),
        professeursAPI.getAll(),
        jurysAPI.getAll()
      ]);

      // Combine all users with their roles
      const allUsers = [
        ...(etudiantsRes.data || []).map(user => ({ ...user, role: 'etudiant' })),
        ...(professeursRes.data || []).map(user => ({ ...user, role: 'professeur' })),
        ...(jurysRes.data || []).map(user => ({ ...user, role: 'jury' }))
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await authAPI.updateUser?.(editingId, formData);
      } else {
        await authAPI.createUser?.(formData);
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      nom: user.nom || '',
      email: user.email || '',
      role: user.role || 'etudiant',
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await authAPI.deleteUser?.(id);
        fetchUsers();
      } catch (error) {
        alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Changer le rôle de cet utilisateur en ${newRole} ?`)) {
      try {
        await authAPI.updateUserRole?.(userId, { role: newRole });
        fetchUsers();
      } catch (error) {
        alert('Erreur lors du changement de rôle: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      role: 'etudiant',
      password: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'professeur':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'etudiant':
        return <User className="w-5 h-5 text-green-600" />;
      case 'jury':
        return <UserCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'professeur':
        return 'bg-blue-100 text-blue-800';
      case 'etudiant':
        return 'bg-green-100 text-green-800';
      case 'jury':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
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
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getRoleIcon(user.role)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getRoleColor(user.role)}`}
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="professeur">Professeur</option>
                    <option value="jury">Jury</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="professeur">Professeur</option>
                  <option value="jury">Jury</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
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

export default Users;



