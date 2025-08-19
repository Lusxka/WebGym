import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user } = useAuth();

  // Se não houver usuário, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se houver usuário, renderiza a página solicitada (ex: Dashboard)
  return <Outlet />;
};