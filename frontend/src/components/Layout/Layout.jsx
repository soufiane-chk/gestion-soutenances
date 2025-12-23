import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex relative">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden transform transition-transform">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;



