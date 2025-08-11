import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

export const WaterTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const t = useTranslation(state.user?.preferences.language);

  const handleAddWater = (amount: number) => {
    dispatch({ type: 'ADD_WATER', payload: amount });
  };

  const progressPercentage = (state.waterIntake.consumed / state.waterIntake.goal) * 100;
  const remainingWater = Math.max(0, state.waterIntake.goal - state.waterIntake.consumed);

  const quickAmounts = [250, 500, 750, 1000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('waterGoals')}</h1>
        <p className="text-gray-400">Mantenha-se hidratado ao longo do dia</p>
      </div>

      {/* Main water tracking card */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-32 h-32 mx-auto mb-6 relative"
          >
            <div className="w-full h-full rounded-full border-8 border-gray-600 relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-blue-500"
                initial={{ height: 0 }}
                animate={{ height: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="text-white w-12 h-12" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {state.waterIntake.consumed}ml
          </h2>
          <p className="text-gray-400">
            de {state.waterIntake.goal}ml ({Math.round(progressPercentage)}%)
          </p>
        </div>

        <ProgressBar
          progress={progressPercentage}
          color="blue"
          size="lg"
          showPercentage={false}
        />

        <div className="mt-4 text-sm text-gray-400">
          {remainingWater > 0 
            ? `Faltam ${remainingWater}ml para atingir sua meta` 
            : 'Meta diária atingida! 🎉'
          }
        </div>
      </Card>

      {/* Quick add buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">{t('addWater')}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              onClick={() => handleAddWater(amount)}
              variant="outline"
              className="flex flex-col items-center py-4"
              disabled={state.waterIntake.consumed >= state.waterIntake.goal}
            >
              <Plus size={20} className="mb-1" />
              {amount}ml
            </Button>
          ))}
        </div>
      </Card>

      {/* Daily tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Histórico Diário</h3>
        
        <div className="space-y-3">
          {[
            { time: '08:00', amount: 250, completed: true },
            { time: '10:00', amount: 500, completed: true },
            { time: '12:00', amount: 250, completed: false },
            { time: '15:00', amount: 500, completed: false },
            { time: '18:00', amount: 250, completed: false },
            { time: '20:00', amount: 250, completed: false },
          ].map((entry, index) => (
            <motion.div
              key={entry.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.completed ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  entry.completed ? 'bg-blue-500' : 'bg-gray-600'
                }`} />
                <span className="text-gray-300">{entry.time}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Droplets size={16} className={entry.completed ? 'text-blue-400' : 'text-gray-400'} />
                <span className={`text-sm ${entry.completed ? 'text-blue-400' : 'text-gray-400'}`}>
                  {entry.amount}ml
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};