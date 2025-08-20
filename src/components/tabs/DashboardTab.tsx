import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Droplets, Zap, Dumbbell, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';

// Interface da prop para navegação
interface DashboardTabProps {
  onNavigate: (tabKey: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { state } = useApp();

  // Função de tradução simples
  const t = (key: string): string => ({
    welcome: 'Bem-vindo',
    workoutProgress: 'Progresso do Treino',
    dietProgress: 'Progresso da Dieta',
    waterIntake: 'Consumo de Água',
    consecutiveDays: 'Dias Consecutivos',
  }[key] || key);

  // Proteção contra undefined
  const workoutProgress = state.workout?.doneToday ? 100 : state.dailyProgress?.workout || 0;
  const dietProgress = state.diet?.doneToday ? 100 : state.dailyProgress?.diet || 0;
  const waterProgress = state.waterIntake?.goal > 0
    ? (state.waterIntake.consumed / state.waterIntake.goal) * 100
    : 0;
  const intensiveProgress = Math.min((state.intensiveMode?.consecutiveDays || 0) / 30 * 100, 100);

  const stats = useMemo(() => [
    { 
      icon: Target, 
      title: t('workoutProgress'), 
      value: `${workoutProgress}%`, 
      progress: workoutProgress, 
      color: 'blue' 
    },
    { 
      icon: TrendingUp, 
      title: t('dietProgress'), 
      value: `${dietProgress}%`, 
      progress: dietProgress, 
      color: 'green' 
    },
    { 
      icon: Droplets, 
      title: t('waterIntake'), 
      value: `${state.waterIntake?.consumed || 0}ml`, 
      progress: waterProgress, 
      color: 'blue' 
    },
    { 
      icon: Zap, 
      title: t('consecutiveDays'), 
      value: `${state.intensiveMode?.consecutiveDays || 0}`, 
      progress: intensiveProgress, 
      color: 'orange' 
    },
  ], [workoutProgress, dietProgress, waterProgress, intensiveProgress, state.waterIntake, state.intensiveMode]);

  const quickActions = useMemo(() => [
    {
      icon: Dumbbell,
      title: "Próximo Treino",
      description: state.workout?.plan?.name || "Treino do dia",
      color: "green", // Alterado para green
      tabKey: "workout",
    },
    {
      icon: Droplets,
      title: "Meta de Água",
      description: `Restam ${Math.max(0, (state.waterIntake?.goal || 0) - (state.waterIntake?.consumed || 0))}ml`,
      color: "blue", // Alterado para blue
      tabKey: "water",
    },
    {
      icon: Zap,
      title: "Modo Intensivo",
      description: `${state.intensiveMode?.consecutiveDays || 0} dias de streak`,
      color: "orange",
      tabKey: "intensive",
    },
  ], [state.workout, state.waterIntake, state.intensiveMode]);

  const handleActionClick = (tabKey: string) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(tabKey);
    }
  };

  if (state.loading) {
    return <div className="text-gray-900 dark:text-white text-center p-8">Carregando seus dados...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('welcome')}, {state.user?.nome || 'Usuário'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Continue sua jornada fitness com determinação!
        </p>
      </motion.div>

      {/* Grid de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <Icon size={24} className={`text-${stat.color}-400`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-3">{stat.title}</h3>
                <ProgressBar progress={stat.progress} color={stat.color} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 cursor-pointer group hover:border-${action.color}-500/50 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700/50`}
                  onClick={() => handleActionClick(action.tabKey)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {action.title}
                      </h3>
                      <p className={`text-sm mb-3 text-${action.color}-600 dark:text-${action.color}-400`}>
                        {action.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <span>Clique para acessar</span>
                        <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 transition-colors`}>
                      <Icon size={20} className={`text-${action.color}-600 dark:text-${action.color}-400 group-hover:text-${action.color}-500 dark:group-hover:text-${action.color}-300 transition-colors`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};