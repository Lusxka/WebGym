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
import { WelcomeWizard } from './WelcomeWizard';
import { Button } from '../components/Button';

export const DashboardPage: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'workout':
        return <WorkoutTab />;
      case 'diet':
        return <DietTab />;
      case 'goals':
        return <GoalsTab />;
      case 'water':
        return <WaterTab />;
      case 'intensive':
        return <IntensiveModeTab />;
      case 'friends':
        return <FriendsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:block w-70 flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={true}
          onClose={() => {}}
        />
      </div>

      {/* Mobile sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                icon={Menu}
              />
              <h1 className="text-2xl font-bold text-white">WebGym</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <img
                src={state.user?.avatar}
                alt={state.user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <p className="text-white font-medium">{state.user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderActiveTab()}
        </main>
      </div>

      {/* Wizard modal */}
      {state.showWizard && <WelcomeWizard />}
    </div>
  );
};