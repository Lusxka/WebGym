import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Apple, Clock, Zap, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';
import { UserProfile } from '../../context/AppContext';

// Adicionando a interface UserPreferences para uso local
interface UserPreferences {
  shareWorkouts: boolean;
  shareDiets: boolean;
  darkMode: boolean;
  language: 'pt_BR' | 'en_US';
}

// CORREÇÃO: Função auxiliar para padronizar o nome do dia da semana, removendo acentos.
const getNormalizedDayName = (date: Date): string => {
  const dayName = date.toLocaleString('pt-BR', { weekday: 'long' }).replace('-feira', '');
  // Mapeia dias com acentos para versões sem
  switch (dayName.toLowerCase()) {
    case 'terça':
      return 'terca';
    case 'sábado':
      return 'sabado';
    default:
      return dayName;
  }
};

export const DietTab: React.FC = () => {
  // Pega a nova função 'confirmMeal' do contexto, não precisamos mais do dispatch aqui.
  const { state, confirmMeal } = useApp();
  const [isLoading, setIsLoading] = useState<string | null>(null); // Controla o loading por botão

  // CORREÇÃO: Analisa a string de preferências para obter o objeto e o idioma correto.
  const parsedPreferences = useMemo((): UserPreferences => {
    try {
      if (state.user?.preferencias && typeof state.user.preferencias === 'string') {
        return JSON.parse(state.user.preferencias);
      }
    } catch (error) {
      console.error("Falha ao fazer parse das preferências:", error);
    }
    // Retorna um valor padrão caso não consiga fazer o parse ou não exista.
    return { shareWorkouts: false, shareDiets: false, darkMode: true, language: 'pt_BR' };
  }, [state.user?.preferencias]);

  const t = useTranslation(parsedPreferences.language);

  // CORREÇÃO: Usa a nova função para obter o dia da semana sem acentos
  const todayDayName = getNormalizedDayName(new Date());
  
  // Encontra o plano de dieta para o dia de hoje no estado global
  const todayDiet = state.dietPlan?.find(d => d.day.toLowerCase() === todayDayName.toLowerCase());

  // Função que chama o 'confirmMeal' do contexto e gerencia o estado de loading
  const handleConfirmMeal = async (day: string, mealId: string) => {
    setIsLoading(mealId); // Ativa o loading para o botão específico
    try {
      await confirmMeal(day, mealId);
    } catch (error) {
      alert('Não foi possível confirmar a refeição. Tente novamente.');
    } finally {
      setIsLoading(null); // Desativa o loading, seja com sucesso ou erro
    }
  };

  // Mostra um loader principal enquanto os dados iniciais do app estão carregando
  if (state.loading) {
    return <div className="text-center text-white p-8">Carregando plano de dieta...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('myDiet')}</h1>
          <p className="text-gray-400">Acompanhe suas refeições diárias</p>
        </div>
      </div>

      {/* Renderização condicional: mostra a dieta do dia ou uma mensagem de aviso */}
      {todayDiet && todayDiet.meals.length > 0 ? (
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
                    meal.confirmed ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
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
                      onClick={() => handleConfirmMeal(todayDayName, meal.id)}
                      disabled={meal.confirmed || isLoading === meal.id}
                      variant={meal.confirmed ? 'secondary' : 'primary'}
                      icon={meal.confirmed ? Check : undefined}
                      size="sm"
                      className="min-w-[120px]" // Garante largura mínima para o texto
                    >
                      {isLoading === meal.id ? 'Confirmando...' : meal.confirmed ? 'Confirmada' : t('confirmMeal')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Resumo do Dia (dinâmico) */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumo do Dia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {todayDiet.meals.filter(m => m.confirmed).length} / {todayDiet.meals.length}
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
          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma dieta para hoje</h3>
          <p className="text-gray-400">
            Parece que não há um plano de dieta cadastrado para {todayDayName}.
          </p>
        </Card>
      )}
    </div>
  );
};
