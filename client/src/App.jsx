import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authService } from './services/auth';

// Importações de páginas
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Legalizacao from './pages/Legalizacao/Legalizacao';
import Onboarding from './pages/Onboarding/Onboarding';
import Contabil from './pages/Contabil/Contabil';
import Fiscal from './pages/Fiscal/Fiscal';
import DP from './pages/DP/DP';
import Usuarios from './pages/Usuarios/Usuarios';

// Componente de Rota Protegida
function RotaProtegida({ children, modulo }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (modulo && !authService.temPermissao(modulo)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  // Aplicar tema ao carregar app
  useEffect(() => {
    const tema = localStorage.getItem('tema') || 'claro';
    if (tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas com layout */}
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <RotaProtegida modulo="ADMIN">
                <Dashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="legalizacao"
            element={
              <RotaProtegida modulo="LEGALIZACAO">
                <Legalizacao />
              </RotaProtegida>
            }
          />
          <Route
            path="onboarding"
            element={
              <RotaProtegida modulo="ONBOARDING">
                <Onboarding />
              </RotaProtegida>
            }
          />
          <Route
            path="contabil"
            element={
              <RotaProtegida modulo="CONTABIL">
                <Contabil />
              </RotaProtegida>
            }
          />
          <Route
            path="fiscal"
            element={
              <RotaProtegida modulo="FISCAL">
                <Fiscal />
              </RotaProtegida>
            }
          />
          <Route
            path="dp"
            element={
              <RotaProtegida modulo="DP">
                <DP />
              </RotaProtegida>
            }
          />

          <Route
            path="usuarios"
            element={
              <RotaProtegida modulo="ADMIN">
                <Usuarios />
              </RotaProtegida>
            }
          />
        </Route>

        {/* Fallback para dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
