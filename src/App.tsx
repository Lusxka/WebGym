// Arquivo: src/App.tsx
// Versão final com as melhorias aplicadas

import React, { Suspense } from 'react'; // Adicionado Suspense
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Nossos novos componentes para organização
import { PrivateRoute } from './components/PrivateRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Otimização: Carregar páginas apenas quando forem necessárias (Code Splitting)
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
// Exemplo: const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

const AppRoutes: React.FC = () => {
  const { state } = useApp();

  return (
    <Routes>
      <Route
        path="/login"
        element={!state.isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
      />

      {/* Rota principal que usa o Layout do Dashboard */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Rotas Filhas: Elas serão renderizadas dentro do <Outlet /> do DashboardLayout */}
        <Route path="dashboard" element={<DashboardPage />} />
        {/* Futuramente, você pode adicionar mais rotas aqui: */}
        {/* <Route path="settings" element={<SettingsPage />} /> */}
        {/* <Route path="friends" element={<FriendsPage />} /> */}
      </Route>

      {/* Redirecionamento da raiz para a rota correta */}
      <Route path="*" element={<Navigate to={state.isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AppProvider>
        <Router>
          {/* Suspense é necessário para o React.lazy funcionar. Mostra um fallback enquanto a página carrega. */}
          <Suspense fallback={<div className="text-white text-center p-8">Carregando...</div>}>
            <AppRoutes />
          </Suspense>
        </Router>
      </AppProvider>
    </div>
  );
}

export default App;