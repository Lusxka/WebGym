import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Award, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

export const IntensiveModeTab: React.FC = () => {
  const { state } = useApp();
  const t = useTranslation(state.user?.preferences.language);

  const intensityLevels = [
    { min: 0, max: 2, label: 'Iniciante', color: 'gray', description: '0-2 dias consecutivos' },
    { min: 3, max: 6, label: 'Motivado', color: 'blue', description: '3-6 dias consecutivos' },
    { min: 7, max: 13, label: 'Consistente', color: 'green', description: '1-2 semanas consecutivas' },
    { min: 14, max: 29, label: 'Dedicado', color: 'purple', description: '2-4 semanas consecutivas' },
    { min: 30, max: 99, label: 'Besta', color: 'orange', description: '1+ mês consecutivo' },
    { min: 100, max: 999, label: 'Lenda', color: 'yellow', description: '100+ dias consecutivos' },
  ];

  const getCurrentLevel = () => {
    return intensityLevels.find(level => 
      state.intensiveMode.consecutiveDays >= level.min && 
      state.intensiveMode.consecutiveDays <= level.max
    ) || intensityLevels[0];
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('intensiveMode')}</h1>
        <p className="text-gray-400">Mantenha sua sequência de treinos e aumente sua intensidade</p>
      </div>

      {/* Current streak */}
      <Card className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-8 border-gray-700">
              <div 
                className={`absolute inset-0 rounded-full border-8 border-orange-500`}
                style={{
                  background: `conic-gradient(from 0deg, #f97316 ${state.intensiveMode.intensity * 3.6}deg, transparent 0deg)`
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-16 h-16 text-orange-400" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-2">
            {state.intensiveMode.consecutiveDays}
          </h2>
          <p className="text-gray-400 mb-4">{t('consecutiveDays')}</p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${currentLevel.color}-500/20 text-${currentLevel.color}-400`}>
            <Award size={20} />
            <span className="font-medium">{currentLevel.label}</span>
          </div>
        </motion.div>

        <ProgressBar
          progress={state.intensiveMode.intensity}
          color="orange"
          size="lg"
        />

        <p className="text-gray-400 text-sm mt-4">
          {currentLevel.description}
        </p>
      </Card>

      {/* Intensity levels */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} />
          Níveis de Intensidade
        </h3>

        <div className="space-y-4">
          {intensityLevels.map((level, index) => {
            const isActive = currentLevel.label === level.label;
            const isCompleted = state.intensiveMode.consecutiveDays > level.max;

            return (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? `border-${level.color}-500 bg-${level.color}-500/10`
                    : isCompleted
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive ? `bg-${level.color}-500/20` : 
                    isCompleted ? 'bg-green-500/20' : 'bg-gray-600'
                  }`}>
                    {isCompleted ? (
                      <Award className="text-green-400" size={20} />
                    ) : (
                      <Zap className={isActive ? `text-${level.color}-400` : 'text-gray-400'} size={20} />
                    )}
                  </div>
                  
                  <div>
                    <h4 className={`font-medium ${
                      isActive ? `text-${level.color}-400` : 
                      isCompleted ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {level.label}
                    </h4>
                    <p className="text-gray-400 text-sm">{level.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isActive ? `text-${level.color}-400` : 
                    isCompleted ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {level.min === level.max ? `${level.min}+` : `${level.min}-${level.max}`} dias
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Estatísticas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {state.intensiveMode.consecutiveDays}
            </div>
            <div className="text-sm text-gray-400">Dias Consecutivos</div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.round(state.intensiveMode.intensity)}%
            </div>
            <div className="text-sm text-gray-400">Intensidade Atual</div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {Math.max(0, state.intensiveMode.consecutiveDays)}
            </div>
            <div className="text-sm text-gray-400">Melhor Sequência</div>
          </div>
        </div>
      </Card>
    </div>
  );
};