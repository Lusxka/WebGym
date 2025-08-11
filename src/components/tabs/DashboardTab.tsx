import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Droplets, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

export const DashboardTab: React.FC = () => {
  const { state } = useApp();
  const t = useTranslation(state.user?.preferences.language);

  const stats = [
    {
      icon: Target,
      title: t('workoutProgress'),
      value: `${state.dailyGoals.workout}%`,
      progress: state.dailyGoals.workout,
      color: 'blue' as const,
    },
    {
      icon: TrendingUp,
      title: t('dietProgress'),
      value: `${state.dailyGoals.diet}%`,
      progress: state.dailyGoals.diet,
      color: 'green' as const,
    },
    {
      icon: Droplets,
      title: t('waterIntake'),
      value: `${state.waterIntake.consumed}ml`,
      progress: (state.waterIntake.consumed / state.waterIntake.goal) * 100,
      color: 'blue' as const,
    },
    {
      icon: Zap,
      title: t('consecutiveDays'),
      value: `${state.intensiveMode.consecutiveDays}`,
      progress: state.intensiveMode.intensity,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('welcome')}, {state.user?.name}! 👋
        </h1>
        <p className="text-gray-400">
          Continue sua jornada fitness com determinação!
        </p>
      </motion.div>

      {/* Stats grid */}
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
              <Card className="p-6 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                    <Icon size={24} className={`text-${stat.color}-400`} />
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                
                <h3 className="text-gray-300 text-sm font-medium mb-3">{stat.title}</h3>
                
                <ProgressBar
                  progress={stat.progress}
                  color={stat.color}
                  size="sm"
                  showPercentage={false}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">Próximo Treino</h3>
              <p className="text-gray-400 text-sm">Segunda-feira</p>
              <p className="text-blue-400 text-sm">Treino A - Peito e Tríceps</p>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">Meta do Dia</h3>
              <p className="text-gray-400 text-sm">Água restante</p>
              <p className="text-green-400 text-sm">{state.waterIntake.goal - state.waterIntake.consumed}ml</p>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">Streak Atual</h3>
              <p className="text-gray-400 text-sm">Dias consecutivos</p>
              <p className="text-orange-400 text-sm">{state.intensiveMode.consecutiveDays} dias</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};