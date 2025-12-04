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
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isEtudiant, isProfesseur, isJury } = useAuth();

  const adminMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Gestion Utilisateurs' },
    { path: '/etudiants', icon: Users, label: 'Étudiants' },
    { path: '/professeurs', icon: GraduationCap, label: 'Professeurs' },
    { path: '/rapports', icon: FileText, label: 'Rapports' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances' },
    { path: '/jurys', icon: UserCheck, label: 'Jurys' },
  ];

  const professeurMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/rapports', icon: FileText, label: 'Rapports' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances' },
    { path: '/jurys', icon: UserCheck, label: 'Mes Jurys' },
  ];

  const etudiantMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/rapports', icon: FileText, label: 'Mes Rapports' },
    { path: '/soutenances', icon: Calendar, label: 'Ma Soutenance' },
  ];

  const juryMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jurys', icon: UserCheck, label: 'Mes Jurys' },
    { path: '/soutenances', icon: Calendar, label: 'Soutenances' },
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
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
