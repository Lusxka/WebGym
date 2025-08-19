import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

export const GoalsTab: React.FC = () => {
  const { state } = useApp();
  const t = useTranslation(state.user?.preferences?.language);

  // As metas diárias agora usam os dados reais do estado global
  const goals = [
    {
      title: 'Meta de Treino Diária',
      description: 'Complete todos os exercícios do dia',
      progress: state.dailyProgress?.workout ?? 0,
      color: 'blue' as const,
      icon: Target,
    },
    {
      title: 'Meta de Dieta Diária',
      description: 'Confirme todas as refeições planejadas',
      progress: state.dailyProgress?.diet ?? 0,
      color: 'green' as const,
      icon: TrendingUp,
    },
    {
      title: 'Meta de Água Diária',
      description: 'Consuma a quantidade recomendada de água',
      progress: ((state.waterIntake?.consumed ?? 0) / (state.waterIntake?.goal || 1)) * 100,
      color: 'blue' as const,
      icon: Target,
    },
  ];

  // As conquistas agora são dinâmicas, baseadas no progresso real do usuário
  const achievements = [
      {
          name: 'Primeira Meta',
          description: 'Complete sua primeira meta diária',
          unlocked: (state.dailyProgress.workout === 100 || state.dailyProgress.diet === 100 || state.waterIntake.consumed >= state.waterIntake.goal)
      },
      {
          name: 'Sequência de 7 Dias',
          description: 'Complete 7 dias consecutivos',
          unlocked: (state.intensiveMode.bestStreak >= 7)
      },
      {
          name: 'Mestre do Fitness',
          description: 'Complete 30 dias consecutivos',
          unlocked: (state.intensiveMode.bestStreak >= 30)
      }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('dailyGoals')}</h1>
        <p className="text-gray-400">Acompanhe seu progresso diário</p>
      </div>

      {/* Cards de Metas Diárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          return (
            <motion.div
              key={goal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-lg bg-${goal.color}-500/20`}>
                    <Icon size={24} className={`text-${goal.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                </div>
                <ProgressBar
                  progress={goal.progress}
                  color={goal.color}
                  size="lg"
                />
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-gray-400">Progresso atual</span>
                  <span className="text-white font-medium">
                    {Math.round(goal.progress)}% concluído
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Seção de Conquistas Dinâmica */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-yellow-400" size={24} />
          <h2 className="text-xl font-bold text-white">Conquistas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div key={ach.name} className={`p-4 rounded-lg text-center transition-opacity ${ach.unlocked ? 'bg-gray-700/50' : 'bg-gray-700/30 opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${ach.unlocked ? 'bg-yellow-500/20' : 'bg-gray-600'}`}>
                <Award size={24} className={ach.unlocked ? 'text-yellow-400' : 'text-gray-500'} />
              </div>
              <h3 className={`font-medium mb-1 ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.name}</h3>
              <p className={`text-sm ${ach.unlocked ? 'text-gray-400' : 'text-gray-500'}`}>{ach.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Visão Geral da Semana Dinâmica */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Visão Geral Semanal</h3>
        <div className="space-y-3">
          {state.weeklyProgress.map((dayData) => (
            <div key={dayData.day} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">{dayData.day}</span>
              <div className="flex items-center gap-3">
                <div className="w-20">
                  <ProgressBar
                    progress={dayData.progress}
                    color="blue"
                    size="sm"
                    showPercentage={false}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round(dayData.progress)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
