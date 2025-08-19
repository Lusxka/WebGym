import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

// 1. Importando TODAS as abas necessárias
import { DashboardTab } from '../components/tabs/DashboardTab';
import { GenerateTab } from '../components/tabs/GenerateTab';
import { WorkoutTab } from '../components/tabs/WorkoutTab';
import { DietTab } from '../components/tabs/DietTab';
import { GoalsTab } from '../components/tabs/GoalsTab';
import { WaterTab } from '../components/tabs/WaterTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { IntensiveModeTab } from '../components/tabs/IntensiveModeTab';
import { FriendsTab } from '../components/tabs/FriendsTab';
import WelcomeWizard from './WelcomeWizard';
import { Button } from '../components/Button';

// 2. Mapeando TODAS as abas aos seus componentes
const tabComponents: { [key: string]: React.FC<any> } = {
  dashboard: DashboardTab,
  generate: GenerateTab,
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

  const handleNavigateToTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setSidebarOpen(false);
  };

  // Lógica para selecionar o componente correto (agora completa)
  const ActiveTabComponent = tabComponents[activeTab] || DashboardTab;

  if (state.loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">Carregando perfil...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            
            <div className="flex items-center gap-3">
              <img
                src={state.user?.avatar_url || `https://ui-avatars.com/api/?name=${state.user?.nome}&background=0D8ABC&color=fff`}
                alt={state.user?.nome}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />
              <div className="hidden sm:block">
                <p className="text-white font-medium">{state.user?.nome}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'dashboard' ? (
            <DashboardTab onNavigate={handleNavigateToTab} />
          ) : (
            <ActiveTabComponent />
          )}
        </main>
      </div>

      {state.showWizard && <WelcomeWizard />}
    </div>
  );
};
