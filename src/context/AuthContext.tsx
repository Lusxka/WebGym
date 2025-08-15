// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

// Define a interface para o valor do contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Cria o contexto de autenticação com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define as props para o provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

// Componente provedor que envolve a aplicação e gerencia o estado de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão atual do Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escuta por mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para fazer logout
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  // O valor fornecido pelo contexto
  const value = {
    session,
    user,
    loading,
    signOut,
  };

  // Renderiza o provedor com os filhos, apenas se não estiver carregando
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação de forma fácil
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
