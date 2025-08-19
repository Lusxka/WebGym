import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Apple, Clock, Zap, Check, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';

export const DietTab: React.FC = () => {
    const { state, confirmMeal } = useApp();
    const { dietPlan, loading } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const todayDayName = useMemo(() => {
        const date = new Date();
        const dayName = date.toLocaleString('pt-BR', { weekday: 'long' }).replace('-feira', '');
        switch (dayName.toLowerCase()) {
            case 'terça': return 'terca';
            case 'sábado': return 'sabado';
            default: return dayName.toLowerCase();
        }
    }, []);

    const todayDiet = useMemo(() => {
        if (!dietPlan || dietPlan.length === 0) return null;
        return dietPlan.find(d => d.day?.toLowerCase() === todayDayName) || null;
    }, [dietPlan, todayDayName]);

    const completedMealsCount = todayDiet?.meals?.filter(m => m.confirmed).length ?? 0;
    const totalMeals = todayDiet?.meals?.length ?? 0;

    const t = useTranslation(state.user?.preferencias ? JSON.parse(state.user.preferencias).language : 'pt_BR');

    const handleConfirmMeal = async (mealId: string) => {
        setIsLoading(mealId);
        try {
            await confirmMeal(mealId, todayDayName);
        } catch (error) {
            console.error('Erro ao confirmar refeição:', error);
            alert('Não foi possível confirmar a refeição. Tente novamente.');
        } finally {
            setIsLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Utensils size={48} className="animate-pulse text-green-500 dark:text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carregando Seu Plano de Dieta...</h2>
            </div>
        );
    }

    if (!todayDiet || !todayDiet.meals || todayDiet.meals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Zap size={48} className="text-yellow-500 dark:text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dia de Descanso ou Sem Plano</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Não há refeições planejadas para hoje. Aproveite o descanso!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('myDiet')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">Acompanhe suas refeições diárias</p>
                </div>
            </div>

            <div className="space-y-4">
                <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Apple className="text-green-600 dark:text-green-400" size={24} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Refeições de Hoje</h2>
                    </div>
                    <div className="space-y-4">
                        {todayDiet.meals.map((meal) => (
                            <motion.div
                                key={meal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className={`p-4 rounded-lg border-2 transition-all ${
                                    meal.confirmed 
                                    ? 'border-green-500 bg-green-500/10' 
                                    : 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meal.name} <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({meal.time})</span></h3>
                                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                    <Clock size={16} />
                                                    <span className="text-sm">{meal.time}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">{meal.description}</p>
                                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                <Zap size={16} />
                                                <span className="text-sm font-medium">{meal.calories} calorias</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleConfirmMeal(meal.id)}
                                            disabled={meal.confirmed || isLoading === meal.id}
                                            icon={meal.confirmed ? Check : undefined}
                                            className={`ml-4 ${meal.confirmed 
                                                ? 'bg-green-500/20 text-green-600 dark:text-green-400 cursor-default' 
                                                : 'bg-green-600 text-white hover:bg-green-500'}`}
                                        >
                                            {isLoading === meal.id ? 'Confirmando...' : meal.confirmed ? 'Confirmada' : 'Confirmar'}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resumo do Dia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {completedMealsCount} / {totalMeals}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Refeições confirmadas</div>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                {todayDiet.meals.reduce((acc, meal) => acc + meal.calories, 0)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Calorias totais</div>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {totalMeals > 0 ? Math.round((completedMealsCount / totalMeals) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Meta alcançada</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
