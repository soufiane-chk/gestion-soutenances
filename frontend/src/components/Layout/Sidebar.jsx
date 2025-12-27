import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  UserCheck,
  Shield,
  Settings,
  Upload,
  UserPlus,
  MessageSquare,
  X,
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { isAdmin, isEtudiant, isProfesseur, isJury } = useAuth();

  const adminMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'from-purple-500 to-pink-500' },
    { path: '/etudiants', icon: Users, label: 'Étudiants', color: 'from-green-500 to-emerald-500' },
    { path: '/admin/affectation', icon: UserPlus, label: 'Affectation', color: 'from-teal-500 to-cyan-500' },
    { path: '/professeurs', icon: GraduationCap, label: 'Professeurs', color: 'from-orange-500 to-red-500' },
    { path: '/documents', icon: Upload, label: 'Documents', color: 'from-indigo-500 to-blue-500' },
    { path: '/encadrement', icon: UserPlus, label: 'Encadrants', color: 'from-teal-500 to-cyan-500' },
    { path: '/rapports', icon: FileText, label: 'Rapports', color: 'from-violet-500 to-purple-500' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances', color: 'from-pink-500 to-rose-500' },
    { path: '/jurys', icon: UserCheck, label: 'Jurys', color: 'from-amber-500 to-yellow-500' },
  ];

  const professeurMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { path: '/encadrement', icon: UserPlus, label: 'Mes Étudiants', color: 'from-teal-500 to-cyan-500' },
    { path: '/rapporteur', icon: MessageSquare, label: 'Évaluation', color: 'from-violet-500 to-purple-500' },
    { path: '/rapports', icon: FileText, label: 'Rapports', color: 'from-indigo-500 to-blue-500' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances', color: 'from-pink-500 to-rose-500' },
    { path: '/jurys', icon: UserCheck, label: 'Mes Jurys', color: 'from-amber-500 to-yellow-500' },
  ];

  const etudiantMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { path: '/documents', icon: Upload, label: 'Documents', color: 'from-indigo-500 to-blue-500' },
    { path: '/rapports', icon: FileText, label: 'Mes Rapports', color: 'from-violet-500 to-purple-500' },
    { path: '/soutenances', icon: Calendar, label: 'Ma Soutenance', color: 'from-pink-500 to-rose-500' },
  ];

  const juryMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { path: '/jurys', icon: UserCheck, label: 'Mes Jurys', color: 'from-amber-500 to-yellow-500' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances', color: 'from-pink-500 to-rose-500' },
  ];

  let menuItems = [];
  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isProfesseur) {
    menuItems = professeurMenuItems;
  } else if (isEtudiant) {
    menuItems = etudiantMenuItems;
  } else if (isJury) {
    menuItems = juryMenuItems;
  }

  return (
    <aside className="w-64 md:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen shadow-2xl lg:shadow-none">
      <div className="p-4 md:p-6">
        {/* Close button for mobile */}
        {onClose && (
          <div className="flex justify-end mb-4 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-white/5 group-hover:bg-white/10'
                } transition-all`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Decorative elements */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Système sécurisé</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
