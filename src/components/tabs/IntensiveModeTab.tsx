import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Award, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';

// Mapeamento de cores para evitar problemas com o Purge do Tailwind CSS
const colorMap = {
    gray: { bg: 'bg-gray-200 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-500' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-500' },
    green: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-500' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-500' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-500' },
};

export const IntensiveModeTab: React.FC = () => {
    const { state } = useApp();
    const userPreferences = state.user?.preferencias ? JSON.parse(state.user.preferencias) : {};
    const t = useTranslation(userPreferences.language || 'pt_BR');

    const consecutiveDays = state.intensiveMode?.consecutiveDays ?? 0;
    const intensity = state.intensiveMode?.intensity ?? 0;

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
            consecutiveDays >= level.min && consecutiveDays <= level.max
        ) || intensityLevels[0];
    };

    const currentLevel = getCurrentLevel();
    const currentColors = colorMap[currentLevel.color as keyof typeof colorMap] || colorMap.gray;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                {/* CORREÇÃO: Título com cores para os dois modos */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('intensiveMode')}</h1>
                {/* CORREÇÃO: Parágrafo com cores para os dois modos */}
                <p className="text-gray-600 dark:text-gray-400">Mantenha sua sequência de treinos e aumente sua intensidade</p>
            </div>

            {/* Current streak */}
            <Card className="p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="mb-6"
                >
                    <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(from 0deg, #f97316 ${intensity * 3.6}deg, #e5e7eb 0deg)`
                            }}
                        />
                        <div className="relative w-[85%] h-[85%] bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                            <Flame className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>

                    {/* CORREÇÃO: Título e texto com cores para os dois modos */}
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {consecutiveDays}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{t('consecutiveDays')}</p>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentColors.bg} ${currentColors.text}`}>
                        <Award size={20} />
                        <span className="font-medium">{currentLevel.label}</span>
                    </div>
                </motion.div>

                <ProgressBar
                    progress={intensity}
                    color="orange"
                    size="lg"
                />

                <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
                    {currentLevel.description}
                </p>
            </Card>

            {/* Intensity levels */}
            <Card className="p-6">
                {/* CORREÇÃO: Título com cores para os dois modos */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Níveis de Intensidade
                </h3>

                <div className="space-y-4">
                    {intensityLevels.map((level, index) => {
                        const isActive = currentLevel.label === level.label;
                        const isCompleted = consecutiveDays > level.max;
                        const levelColors = colorMap[level.color as keyof typeof colorMap] || colorMap.gray;
                        
                        let activeClasses = 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50';
                        if (isActive) {
                            activeClasses = `${levelColors.border} ${levelColors.bg}`;
                        } else if (isCompleted) {
                            activeClasses = `${colorMap.green.border} ${colorMap.green.bg}`;
                        }

                        return (
                            <motion.div
                                key={level.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${activeClasses}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        isActive ? levelColors.bg : isCompleted ? colorMap.green.bg : 'bg-gray-200 dark:bg-gray-600'
                                    }`}>
                                        {isCompleted ? (
                                            <Award className="text-green-600 dark:text-green-400" size={20} />
                                        ) : (
                                            <Zap className={isActive ? levelColors.text : 'text-gray-600 dark:text-gray-400'} size={20} />
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className={`font-medium ${
                                            isActive ? levelColors.text : isCompleted ? colorMap.green.text : 'text-gray-900 dark:text-gray-300'
                                        }`}>
                                            {level.label}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{level.description}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`text-sm font-medium ${
                                        isActive ? levelColors.text : isCompleted ? colorMap.green.text : 'text-gray-600 dark:text-gray-400'
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
                {/* CORREÇÃO: Título com cores para os dois modos */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Estatísticas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CORREÇÃO: Fundo, borda e texto para os dois modos */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                            {consecutiveDays}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Dias Consecutivos</div>
                    </div>
                    
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {Math.round(intensity)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Intensidade Atual</div>
                    </div>
                    
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                            {consecutiveDays}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Melhor Sequência</div>
                    </div>
                </div>
            </Card>
        </div>
    );
};