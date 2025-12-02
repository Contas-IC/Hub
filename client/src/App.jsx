import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authService } from './services/auth';

// Importações de páginas
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Legalizacao from './pages/Legalizacao/Legalizacao';
import Clientes from './pages/Legalizacao/Clientes';
import Financeiros from './pages/Legalizacao/Financeiros';
import Certificados from './pages/Legalizacao/Certificados';
import Agenda from './pages/Legalizacao/Agenda';
import Configuracoes from './pages/Legalizacao/Configuracoes';
import Onboarding from './pages/Onboarding/Onboarding';
import Contabil from './pages/Contabil/Contabil';
import Fiscal from './pages/Fiscal/Fiscal';
import DP from './pages/DP/DP';
import Usuarios from './pages/Usuarios/Usuarios';

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

        {/* Dashboard e Usuários com Layout Principal */}
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
              <RotaProtegida>
                <Dashboard />
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

        {/* Módulo de Legalização - Rotas Completas */}
        <Route
          path="/legalizacao"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Legalizacao />
            </RotaProtegida>
          }
        />
        <Route
          path="/legalizacao/clientes"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Clientes />
            </RotaProtegida>
          }
        />
        <Route
          path="/legalizacao/financeiros"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Financeiros />
            </RotaProtegida>
          }
        />
        <Route
          path="/legalizacao/certificados"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Certificados />
            </RotaProtegida>
          }
        />
        <Route
          path="/legalizacao/agenda"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Agenda />
            </RotaProtegida>
          }
        />
        <Route
          path="/legalizacao/configuracoes"
          element={
            <RotaProtegida modulo="LEGALIZACAO">
              <Configuracoes />
            </RotaProtegida>
          }
        />

        {/* Outros Módulos */}
        <Route
          path="/onboarding/*"
          element={
            <RotaProtegida modulo="ONBOARDING">
              <Onboarding />
            </RotaProtegida>
          }
        />
        <Route
          path="/contabil/*"
          element={
            <RotaProtegida modulo="CONTABIL">
              <Contabil />
            </RotaProtegida>
          }
        />
        <Route
          path="/fiscal/*"
          element={
            <RotaProtegida modulo="FISCAL">
              <Fiscal />
            </RotaProtegida>
          }
        />
        <Route
          path="/dp/*"
          element={
            <RotaProtegida modulo="DP">
              <DP />
            </RotaProtegida>
          }
        />

        {/* Fallback para dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
