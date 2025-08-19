import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de layout que protege rotas.
 * Garante que o status de autenticação seja verificado ANTES de tentar renderizar a rota filha.
 */
export const ProtectedRoute: React.FC = () => {
  // Pega tanto o usuário quanto o status de carregamento.
  const { user, loading } = useAuth();

  // PASSO 1: Enquanto o app verifica se o usuário está logado, exibe um spinner.
  // Este passo é ESSENCIAL para evitar redirecionamentos incorretos.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // PASSO 2: APÓS o carregamento, se não houver usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // PASSO 3: Se houver um usuário, renderiza a rota filha (DashboardPage) através do Outlet.
  // O Outlet garante que o contexto continue fluindo corretamente.
  return <Outlet />;
};

export default ProtectedRoute;