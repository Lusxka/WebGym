import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  Target, 
  Droplets, 
  Settings, 
  Zap, 
  Users,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../data/translations';
import { useMediaQuery } from '../hooks/useMediaQuery'; // CORREÇÃO: Importe o novo hook

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const { state, dispatch } = useApp();
  const t = useTranslation(state.user?.preferences.language);
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // CORREÇÃO: Detecta se a tela é grande (lg)

  const menuItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'workout', icon: Dumbbell, label: t('myWorkout') },
    { id: 'diet', icon: Apple, label: t('myDiet') },
    { id: 'goals', icon: Target, label: t('dailyGoals') },
    { id: 'water', icon: Droplets, label: t('waterGoals') },
    { id: 'intensive', icon: Zap, label: t('intensiveMode') },
    { id: 'friends', icon: Users, label: t('friends') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && !isDesktop && ( // CORREÇÃO: O overlay só aparece em telas móveis
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false} // Evita animação inicial desnecessária
        // CORREÇÃO 1: A animação 'x' agora só se aplica se NÃO for desktop
        animate={{ x: isDesktop ? 0 : (isOpen ? 0 : -280) }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        // CORREÇÃO 2: A classe 'w-70' foi trocada por 'w-72'
        className="fixed left-0 top-0 z-50 h-full w-72 bg-gray-900 border-r border-gray-700 lg:relative lg:translate-x-0 lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Dumbbell size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">WebGym</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={state.user?.avatar}
                alt={state.user?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-medium">{state.user?.name}</p>
                <p className="text-gray-400 text-sm">{state.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto"> {/* Adicionado overflow para o caso de muitos itens */}
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <motion.button
                      whileHover={{ x: isDesktop ? 4 : 0 }} // Animação de hover só no desktop
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onTabChange(item.id);
                        onClose(); // Isso vai fechar a sidebar no mobile, e não tem efeito no desktop
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <motion.button
              whileHover={{ x: isDesktop ? 4 : 0 }} // Animação de hover só no desktop
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">{t('logout')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};