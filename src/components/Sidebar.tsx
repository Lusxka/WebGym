import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Dumbbell,
  Target,
  Calendar,
  Droplets,
  Zap,
  Users,
  Settings,
  X,
  Wand2,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SidebarContent: React.FC<Omit<SidebarProps, 'isOpen'>> = ({
  activeTab,
  onTabChange,
  onClose,
}) => {
  const { signOut } = useAuth();
  const { state } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'generate', label: 'Gerar', icon: Wand2, highlight: !state.hasCompletedProfile },
    { id: 'workout', label: 'Treinos', icon: Dumbbell },
    { id: 'diet', label: 'Dieta', icon: Target },
    { id: 'goals', label: 'Metas', icon: Calendar },
    { id: 'water', label: 'Hidratação', icon: Droplets },
    { id: 'intensive', label: 'Modo Intensivo', icon: Zap },
    { id: 'friends', label: 'Amigos', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    // CORREÇÃO: Adicionando classes para modo claro para o container e cores de texto
    <div className="flex h-full flex-col bg-gray-200 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">WebGym</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src={state.user?.avatar_url || `https://ui-avatars.com/api/?name=${state.user?.nome}&background=0D8ABC&color=fff`}
            alt={state.user?.nome || 'Usuário'}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-400 dark:border-gray-600"
          />
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white font-medium truncate">
              {state.user?.nome || 'Usuário'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {state.hasCompletedProfile ? 'Perfil completo' : 'Complete seu perfil'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHighlighted = tab.highlight;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                } ${isHighlighted ? 'ring-2 ring-orange-400/50 bg-orange-500/10' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isHighlighted ? 'text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="font-medium">{tab.label}</span>
                {isHighlighted && (
                  <span className="ml-auto flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-200 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 lg:hidden"
          >
            <SidebarContent
              activeTab={activeTab}
              onTabChange={onTabChange}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <div 
        className="hidden lg:flex lg:w-80 lg:flex-col bg-gray-200 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700"
      >
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onClose={onClose}
        />
      </div>
    </>
  );
};