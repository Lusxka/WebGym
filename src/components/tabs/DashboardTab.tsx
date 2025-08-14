import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Droplets, Zap, Dumbbell, ChevronRight } from 'lucide-react';

// --- Início dos Mocks e Componentes Auxiliares ---
// Em um projeto real, estes seriam importados de seus respectivos arquivos.
// Eles estão aqui para que o componente funcione de forma autônoma.

const useApp = () => ({
  state: {
    user: { name: 'Dimas', preferences: { language: 'pt-BR' } },
    dailyGoals: { workout: 75, diet: 90 },
    waterIntake: { consumed: 1500, goal: 3000 },
    intensiveMode: { consecutiveDays: 12, intensity: 80 },
  }
});

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl ${className}`}>
        {children}
    </div>
);

const ProgressBar = ({ progress, color }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full bg-${color}-500`} style={{ width: `${progress}%` }}></div>
    </div>
);

const useTranslation = () => (key) => ({
  welcome: 'Bem-vindo',
  workoutProgress: 'Progresso do Treino',
  dietProgress: 'Progresso da Dieta',
  waterIntake: 'Consumo de Água',
  consecutiveDays: 'Dias Consecutivos',
}[key] || key);

// --- Fim dos Mocks ---

export const DashboardTab = ({ onNavigate }) => {
  const { state } = useApp();
  const t = useTranslation(state.user?.preferences.language);

  const stats = [
    { icon: Target, title: t('workoutProgress'), value: `${state.dailyGoals.workout}%`, progress: state.dailyGoals.workout, color: 'blue' },
    { icon: TrendingUp, title: t('dietProgress'), value: `${state.dailyGoals.diet}%`, progress: state.dailyGoals.diet, color: 'green' },
    { icon: Droplets, title: t('waterIntake'), value: `${state.waterIntake.consumed}ml`, progress: (state.waterIntake.consumed / state.waterIntake.goal) * 100, color: 'blue' },
    { icon: Zap, title: t('consecutiveDays'), value: `${state.intensiveMode.consecutiveDays}`, progress: state.intensiveMode.intensity, color: 'orange' },
  ];

  const quickActions = [
    {
      icon: Dumbbell,
      title: "Próximo Treino",
      description: "Treino A - Peito e Tríceps",
      color: "blue",
      tabKey: "workout", // Chave para navegação
    },
    {
      icon: Droplets,
      title: "Meta de Água",
      description: `Restam ${state.waterIntake.goal - state.waterIntake.consumed}ml`,
      color: "cyan",
      tabKey: "water", // Chave para navegação
    },
    {
      icon: Zap,
      title: "Modo Intensivo",
      description: `${state.intensiveMode.consecutiveDays} dias de streak`,
      color: "orange",
      tabKey: "intensive", // Chave para navegação
    },
  ];

  const handleActionClick = (tabKey) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(tabKey);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mensagem de boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('welcome')}, {state.user?.name}! 👋
        </h1>
        <p className="text-gray-400">
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
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-300 text-sm font-medium mb-3">{stat.title}</h3>
                <ProgressBar
                  progress={stat.progress}
                  color={stat.color}
                />
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
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`p-5 rounded-xl border border-gray-700 bg-gray-800/50 cursor-pointer group hover:border-${action.color}-500/50 transition-all duration-300 hover:bg-gray-700/50`}
                  onClick={() => handleActionClick(action.tabKey)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1 group-hover:text-white transition-colors">
                        {action.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        action.tabKey === 'workout' ? 'text-white' : 
                        action.tabKey === 'water' ? 'text-blue-400' :
                        `text-${action.color}-400`
                      }`}>
                        {action.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        <span>Clique para acessar</span>
                        <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 transition-colors`}>
                      <Icon size={20} className={`text-${action.color}-400 group-hover:text-${action.color}-300 transition-colors`} />
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