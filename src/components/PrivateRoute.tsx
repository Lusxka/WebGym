// Arquivo: src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Este componente "envolve" uma rota
export const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { state } = useApp();

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Se estiver autenticado, renderiza o componente filho (a página que ele tentou acessar)
  return children;
};