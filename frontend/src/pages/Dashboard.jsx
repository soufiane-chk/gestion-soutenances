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
  const [myEtudiant, setMyEtudiant] = useState(null);
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
        const [rapports, soutenances, etudiants] = await Promise.all([
          rapportsAPI.getAll().catch(() => ({ data: [] })),
          soutenancesAPI.getAll().catch(() => ({ data: [] })),
          etudiantsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const myRapports = rapports.data?.filter(r => r.etudiant?.user_id === user?.id) || [];
        const mySoutenances = soutenances.data?.filter(s => s.etudiant?.user_id === user?.id) || [];
        const me = etudiants.data?.find(e => e.user_id === user?.id) || null;

        setMyData({
          rapports: myRapports,
          soutenances: mySoutenances,
          jurys: [],
        });
        setMyEtudiant(me);
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
      { label: 'Étudiants', value: stats.etudiants, icon: Users, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
      { label: 'Professeurs', value: stats.professeurs, icon: GraduationCap, gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50' },
      { label: 'Rapports', value: stats.rapports, icon: FileText, gradient: 'from-yellow-500 to-orange-500', bgGradient: 'from-yellow-50 to-orange-50' },
      { label: 'Soutenances', value: stats.soutenances, icon: Calendar, gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-50 to-pink-50' },
    ];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600">Vue d'ensemble du système</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 card-hover border border-white/50 shadow-xl`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-2xl transform translate-x-8 -translate-y-8">
                  <Icon className="w-full h-full" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                  <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                      style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
                    ></div>
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Mon Dashboard
          </h1>
          <p className="text-gray-600">Bienvenue dans votre espace étudiant</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Mes Rapports</h2>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-5xl font-bold gradient-text mb-2">{myData.rapports.length}</p>
            <p className="text-gray-600 text-sm">Rapport(s) déposé(s)</p>
            <div className="mt-4 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${Math.min((myData.rapports.length / 5) * 100, 100)}%` }}></div>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Ma Soutenance</h2>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            {myData.soutenances.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    {myData.soutenances[0].theme || 'Soutenance planifiée'}
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date: {new Date(myData.soutenances[0].date_soutenance).toLocaleDateString('fr-FR')}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span>📍</span>
                      <span>Salle: {myData.soutenances[0].salle}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600">Aucune soutenance planifiée</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Mes Affectations</h2>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            {myEtudiant ? (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-600">Encadrant</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {myEtudiant.encadrant?.user?.nom || 'Non affecté'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-sm text-gray-600">Rapporteur</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {myEtudiant.rapporteur?.user?.nom || 'Non affecté'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600">Aucune affectation disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isProfesseur) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Dashboard Professeur
          </h1>
          <p className="text-gray-600">Gérez vos activités d'encadrement</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Rapports</h2>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold gradient-text">{myData.rapports.length}</p>
            <p className="text-gray-600 text-sm mt-2">Rapports à évaluer</p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Soutenances</h2>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold gradient-text">{myData.soutenances.length}</p>
            <p className="text-gray-600 text-sm mt-2">Soutenances planifiées</p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 card-hover border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Activités</h2>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold gradient-text">Actif</p>
            <p className="text-gray-600 text-sm mt-2">En cours</p>
          </div>
        </div>
      </div>
    );
  }

  if (isJury) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Dashboard Jury
          </h1>
          <p className="text-gray-600">Évaluation des soutenances</p>
        </div>
        
        <div className="glass-effect rounded-2xl p-8 card-hover border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Soutenances à évaluer</h2>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-6xl font-bold gradient-text mb-4">{myData.soutenances.length}</p>
          <p className="text-gray-600">Soutenance(s) en attente d'évaluation</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
