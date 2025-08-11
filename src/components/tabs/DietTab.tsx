import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, Clock, Zap, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { mockDiets } from '../../data/diets';
import { useTranslation } from '../../data/translations';

export const DietTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const t = useTranslation(state.user?.preferences.language);

  useEffect(() => {
    if (state.dietPlan.length === 0) {
      dispatch({ type: 'SET_DIET_PLAN', payload: mockDiets });
    }
  }, [state.dietPlan.length, dispatch]);

  const handleConfirmMeal = (day: string, mealId: string) => {
    dispatch({
      type: 'CONFIRM_MEAL',
      payload: { day, mealId }
    });
  };

  const todayDiet = state.dietPlan.find(d => d.day === 'monday'); // Mock today as Monday

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('myDiet')}</h1>
          <p className="text-gray-400">Acompanhe suas refeições diárias</p>
        </div>
      </div>

      {/* Today's meals */}
      {todayDiet ? (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Apple className="text-green-400" size={24} />
              <h2 className="text-xl font-bold text-white">Refeições de Hoje</h2>
            </div>

            <div className="space-y-4">
              {todayDiet.meals.map((meal) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    meal.confirmed
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={16} />
                          <span className="text-sm">{meal.time}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{meal.description}</p>
                      
                      <div className="flex items-center gap-1 text-orange-400">
                        <Zap size={16} />
                        <span className="text-sm font-medium">{meal.calories} calorias</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleConfirmMeal('monday', meal.id)}
                      disabled={meal.confirmed}
                      variant={meal.confirmed ? 'secondary' : 'primary'}
                      icon={meal.confirmed ? Check : undefined}
                      size="sm"
                    >
                      {meal.confirmed ? 'Confirmada' : t('confirmMeal')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Daily summary */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumo do Dia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {todayDiet.meals.filter(m => m.confirmed).length}
                </div>
                <div className="text-sm text-gray-400">Refeições confirmadas</div>
              </div>
              
              <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {todayDiet.meals.reduce((acc, meal) => acc + meal.calories, 0)}
                </div>
                <div className="text-sm text-gray-400">Calorias totais</div>
              </div>
              
              <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {Math.round((todayDiet.meals.filter(m => m.confirmed).length / todayDiet.meals.length) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Meta alcançada</div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <Apple className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma dieta configurada</h3>
          <p className="text-gray-400 mb-4">
            Configure sua dieta personalizada através do assistente de configuração.
          </p>
          <Button>Configurar Dieta</Button>
        </Card>
      )}
    </div>
  );
};