import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Etudiants from './pages/Etudiants';
import Professeurs from './pages/Professeurs';
import Rapports from './pages/Rapports';
import Soutenances from './pages/Soutenances';
import Jurys from './pages/Jurys';
import Users from './pages/Admin/Users';
import Documents from './pages/Documents';
import Encadrement from './pages/Encadrement';
import Rapporteur from './pages/Rapporteur';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Routes Admin uniquement */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/etudiants"
            element={
              <ProtectedRoute>
                <Layout>
                  <Etudiants />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/professeurs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Professeurs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Rapports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/soutenances"
            element={
              <ProtectedRoute>
                <Layout>
                  <Soutenances />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jurys"
            element={
              <ProtectedRoute>
                <Layout>
                  <Jurys />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Documents />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/encadrement"
            element={
              <ProtectedRoute>
                <Layout>
                  <Encadrement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rapporteur"
            element={
              <ProtectedRoute requiredRole="professeur">
                <Layout>
                  <Rapporteur />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

