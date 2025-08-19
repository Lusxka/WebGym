// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * Layout para rotas públicas.
 * Se o usuário já estiver logado, redireciona para o dashboard.
 * Caso contrário, renderiza a rota pública (ex: /login).
 */
const PublicRoutesLayout: React.FC = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

/**
 * Componente para gerenciar as rotas da aplicação.
 * Define a estrutura de navegação e as regras de acesso.
 */
const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    // Exibe um indicador de carregamento enquanto a sessão do usuário é verificada.
    // Isso evita um "flash" da tela de login para usuários já autenticados.
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Rota raiz: redireciona para o dashboard ou login dependendo do status de autenticação */}
            <Route
                path="/"
                element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />

            {/* --- Rotas Públicas --- */}
            {/* Rotas aninhadas sob um layout que só permite acesso a usuários não logados */}
            <Route element={<PublicRoutesLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* --- Rotas Protegidas --- */}
            {/* Rotas aninhadas sob o layout de proteção que exige autenticação */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* Adicione outras rotas que precisam de login aqui */}
                {/* Ex: <Route path="/perfil" element={<ProfilePage />} /> */}
            </Route>

            {/* Rota de fallback para qualquer URL não encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

/**
 * Componente principal da aplicação.
 * Configura os provedores de contexto globais.
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