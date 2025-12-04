import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { etudiantsAPI, professeursAPI, rapportsAPI, soutenancesAPI } from '../services/api';
import { Users, GraduationCap, FileText, Calendar, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isEtudiant, isProfesseur, isJury } = useAuth();
  const [stats, setStats] = useState({
    etudiants: 0,
    professeurs: 0,
    rapports: 0,
    soutenances: 0,
  });
  const [myData, setMyData] = useState({
    rapports: [],
    soutenances: [],
    jurys: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        // Dashboard Admin - toutes les statistiques
        const [etudiants, professeurs, rapports, soutenances] = await Promise.all([
          etudiantsAPI.getAll().catch(() => ({ data: [] })),
          professeursAPI.getAll().catch(() => ({ data: [] })),
          rapportsAPI.getAll().catch(() => ({ data: [] })),
          soutenancesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        setStats({
          etudiants: etudiants.data?.length || 0,
          professeurs: professeurs.data?.length || 0,
          rapports: rapports.data?.length || 0,
          soutenances: soutenances.data?.length || 0,
        });
      } else if (isEtudiant) {
        // Dashboard Étudiant - ses propres données
        const [rapports, soutenances] = await Promise.all([
          rapportsAPI.getAll().catch(() => ({ data: [] })),
          soutenancesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const myRapports = rapports.data?.filter(r => r.etudiant_id === user?.etudiant?.id) || [];
        const mySoutenances = soutenances.data?.filter(s => s.etudiant_id === user?.etudiant?.id) || [];

        setMyData({
          rapports: myRapports,
          soutenances: mySoutenances,
          jurys: [],
        });
      } else if (isProfesseur) {
        // Dashboard Professeur - ses données
        const [rapports, soutenances] = await Promise.all([
          rapportsAPI.getAll().catch(() => ({ data: [] })),
          soutenancesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        setMyData({
          rapports: rapports.data || [],
          soutenances: soutenances.data || [],
          jurys: [],
        });
      } else if (isJury) {
        // Dashboard Jury
        const soutenances = await soutenancesAPI.getAll().catch(() => ({ data: [] }));
        setMyData({
          rapports: [],
          soutenances: soutenances.data || [],
          jurys: [],
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAdmin) {
    const statCards = [
      { label: 'Étudiants', value: stats.etudiants, icon: Users, color: 'bg-blue-500' },
      { label: 'Professeurs', value: stats.professeurs, icon: GraduationCap, color: 'bg-green-500' },
      { label: 'Rapports', value: stats.rapports, icon: FileText, color: 'bg-yellow-500' },
      { label: 'Soutenances', value: stats.soutenances, icon: Calendar, color: 'bg-purple-500' },
    ];

    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Administrateur</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isEtudiant) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Mon Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Mes Rapports</h2>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{myData.rapports.length}</p>
            <p className="text-gray-600 text-sm mt-2">Rapport(s) déposé(s)</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ma Soutenance</h2>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            {myData.soutenances.length > 0 ? (
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {myData.soutenances[0].theme}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Date: {myData.soutenances[0].date_soutenance}
                </p>
                <p className="text-gray-600 text-sm">Salle: {myData.soutenances[0].salle}</p>
              </div>
            ) : (
              <p className="text-gray-600">Aucune soutenance planifiée</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isProfesseur) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Professeur</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Rapports</h2>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{myData.rapports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Soutenances</h2>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{myData.soutenances.length}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isJury) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Jury</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Soutenances à évaluer</h2>
          <p className="text-3xl font-bold text-gray-800">{myData.soutenances.length}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
