import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { DashboardTab } from '../components/tabs/DashboardTab';
import { WorkoutTab } from '../components/tabs/WorkoutTab';
import { DietTab } from '../components/tabs/DietTab';
import { GoalsTab } from '../components/tabs/GoalsTab';
import { WaterTab } from '../components/tabs/WaterTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { IntensiveModeTab } from '../components/tabs/IntensiveModeTab';
import { FriendsTab } from '../components/tabs/FriendsTab';
import WelcomeWizard from './WelcomeWizard';
import { Button } from '../components/Button';

// ✨ DICA: Mapear os componentes de abas pode deixar o código mais limpo que um switch.
const tabComponents: { [key: string]: React.FC } = {
  dashboard: DashboardTab,
  workout: WorkoutTab,
  diet: DietTab,
  goals: GoalsTab,
  water: WaterTab,
  intensive: IntensiveModeTab,
  friends: FriendsTab,
  settings: SettingsTab,
};

export const DashboardPage: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveTabComponent = tabComponents[activeTab] || DashboardTab;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* MELHORIA 1: Componente Sidebar unificado */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); // Fecha a sidebar ao trocar de aba no mobile
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MELHORIA 2: Fundo de overlay para a sidebar móvel */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden" // Mostra apenas em telas menores que 'lg'
              >
                <Menu className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-2xl font-bold text-white">WebGym</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <img
                src={state.user?.avatar || `https://ui-avatars.com/api/?name=${state.user?.name}&background=0D8ABC&color=fff`}
                alt={state.user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />
              <div className="hidden sm:block">
                <p className="text-white font-medium">{state.user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Área de conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ActiveTabComponent />
        </main>
      </div>

      {/* Wizard modal */}
      {state.showWizard && <WelcomeWizard />}
    </div>
  );
};