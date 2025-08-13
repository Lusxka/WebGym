// Arquivo: src/layouts/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

// Este é basicamente o seu componente DashboardPage, mas sem o conteúdo específico da aba.
// Você vai mover a lógica da sidebar, header, etc. para cá.
// Por simplicidade, vou usar o código que já corrigimos.

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/Button';
import { WelcomeWizard } from '../pages/WelcomeWizard';

export const DashboardLayout: React.FC = () => {
  const { state } = useApp();
  // A lógica de qual aba está ativa será movida para as páginas filhas ou gerenciada de outra forma
  // Por enquanto, vamos simplificar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* A Sidebar agora faz parte do Layout */}
      <Sidebar
        activeTab={'dashboard'} // Isso precisaria de uma lógica mais avançada com useLocation
        onTabChange={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-2xl font-bold text-white">WebGym</h1>
            </div>
            {/* ...código do avatar do usuário... */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* O Outlet renderiza a rota filha aqui! */}
          <Outlet />
        </main>
      </div>

      {state.showWizard && <WelcomeWizard />}
    </div>
  );
};