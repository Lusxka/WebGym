import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute'; // 1. Importe o novo componente

/**
 * Componente para gerenciar as rotas da aplicação.
 */
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        {/* 2. Indicador de carregamento visual */}
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- Rotas Públicas --- */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />

      {/* --- Rotas Protegidas --- */}
      {/* 3. Lógica de proteção de rotas centralizada */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Adicione outras rotas que precisam de login aqui */}
        {/* Ex: <Route path="/perfil" element={<ProfilePage />} /> */}
      </Route>
    </Routes>
  );
};

/**
 * Componente principal da aplicação.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider> 
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;