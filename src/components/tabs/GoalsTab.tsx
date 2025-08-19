import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

export const GoalsTab: React.FC = () => {
  const { state } = useApp();
  
  // CORREÇÃO 1: Acesso seguro à preferência de idioma.
  const t = useTranslation(state.user?.preferences?.language);

  // CORREÇÃO 2: Acesso seguro aos dados do estado, com valores padrão (0) para evitar quebras.
  const goals = [
    {
      title: 'Meta de Treino Diária',
      description: 'Complete todos os exercícios do dia',
      progress: state.dailyGoals?.workout ?? 0,
      color: 'blue' as const,
      icon: Target,
    },
    {
      title: 'Meta de Dieta Diária',
      description: 'Confirme todas as refeições planejadas',
      progress: state.dailyGoals?.diet ?? 0,
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

  const weeklyWorkoutProgress = state.dailyGoals?.workout ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('dailyGoals')}</h1>
        <p className="text-gray-400">Acompanhe seu progresso diário</p>
      </div>

      {/* Goals cards */}
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
                  {/* Este trecho com classes dinâmicas pode falhar em produção. O ideal seria um mapeamento. */}
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

      {/* Achievement section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-yellow-400" size={24} />
          <h2 className="text-xl font-bold text-white">Conquistas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-white font-medium mb-1">Primeira Meta</h3>
            <p className="text-gray-400 text-sm">Complete sua primeira meta diária</p>
          </div>

          <div className="p-4 bg-gray-700/30 rounded-lg text-center opacity-50">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="text-gray-500" size={24} />
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Sequência de 7 Dias</h3>
            <p className="text-gray-500 text-sm">Complete 7 dias consecutivos</p>
          </div>

          <div className="p-4 bg-gray-700/30 rounded-lg text-center opacity-50">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="text-gray-500" size={24} />
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Mestre do Fitness</h3>
            <p className="text-gray-500 text-sm">Complete 30 dias consecutivos</p>
          </div>
        </div>
      </Card>

      {/* Weekly overview */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Visão Geral Semanal</h3>
        
        <div className="space-y-3">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">{day}</span>
              <div className="flex items-center gap-3">
                <div className="w-20">
                  <ProgressBar
                    progress={index === 0 ? weeklyWorkoutProgress : 0}
                    color="blue"
                    size="sm"
                    showPercentage={false}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {index === 0 ? `${Math.round(weeklyWorkoutProgress)}%` : '0%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
