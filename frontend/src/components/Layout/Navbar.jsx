import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, GraduationCap } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const getRoleBadge = () => {
    const roles = {
      admin: 'bg-purple-500',
      professeur: 'bg-blue-500',
      etudiant: 'bg-green-500',
      jury: 'bg-orange-500',
    };
    return roles[user?.role] || 'bg-gray-500';
  };

  return (
    <nav className="glass-effect sticky top-0 z-30 border-b border-white/20 shadow-lg backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold gradient-text">
                  Gestion Soutenances
                </h1>
                <p className="text-xs text-gray-500 hidden md:block">Plateforme de gestion</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-4 py-2 glass-effect rounded-full">
              <div className={`w-2 h-2 rounded-full ${getRoleBadge()} animate-pulse`}></div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.nom || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



