import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Video, Check, RefreshCw, Award, BarChart2, Zap, ChevronDown, Lock, Moon, Calendar } from 'lucide-react';

// Imports reais dos seus componentes e contexto
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { VideoPlayer } from '../VideoPlayer';

// Tipos de dados (ajuste se necessário)
interface Exercise {
    id: string;
    nome: string;
    series: string;
    repeticoes: string;
    concluido: boolean;
    video_url: string | null;
    descanso: string | null;
    observacao: string | null;
    ordem: number;
}

interface WorkoutDay {
    id: string;
    nome: string;
    dia_semana: string;
    objetivo: string | null;
    concluido: boolean;
    exercicios_treino: Exercise[];
}

// Mock simples para a função de tradução, substitua se tiver uma real
const useTranslation = () => (key: string) => ({
    monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
    sets: 'séries', reps: 'reps', completed: 'Concluído', markAsCompleted: 'Marcar como Concluído'
}[key] || key);

// Função para obter o nome do dia atual em formato normalizado
const getNormalizedDayName = (date?: Date): string => {
    const target = date || new Date();
    const dayName = target.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
    switch (dayName.toLowerCase()) {
        case 'terça': return 'terca';
        case 'sábado': return 'sabado';
        default: return dayName.toLowerCase();
    }
};

// Função para verificar se é dia de descanso
const isRestDay = (day: WorkoutDay): boolean => {
    return !day.exercicios_treino || 
           day.exercicios_treino.length === 0 || 
           day.nome.toLowerCase().includes('descanso') ||
           day.objetivo === 'descanso';
};

// Função para obter o ícone apropriado
const getDayIcon = (day: WorkoutDay): React.ElementType => {
    if (isRestDay(day)) {
        return Moon;
    }
    return Dumbbell;
};

export const WorkoutTab = () => {
    const { state, markExerciseAsCompleted, resetWeekProgress } = useApp();
    
    const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openVideoId, setOpenVideoId] = useState<string | null>(null);
    const [isCompletingExercise, setIsCompletingExercise] = useState<string | null>(null);
    const t = useTranslation();

    const workoutPlan = state.workoutPlan as WorkoutDay[] | null;
    const isLoading = state.loading;

    // Obtém o dia atual e a ordem dos dias
    const currentDayName = getNormalizedDayName();
    const orderedDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const currentDayIndex = orderedDays.indexOf(currentDayName);

    // Sincroniza o estado local do modal com o estado global
    useEffect(() => {
        if (workoutPlan && selectedDay) {
            const updatedDay = workoutPlan.find(d => d.id === selectedDay.id);
            if (updatedDay) {
                setSelectedDay(updatedDay);
            }
        }
    }, [workoutPlan, selectedDay?.id]);

    const handleDayClick = (day: WorkoutDay) => {
        setSelectedDay(day);
        setIsModalOpen(true);
        setOpenVideoId(null);
    };

    const handleCompleteExercise = async (exerciseId: string) => {
        if (!selectedDay) return;

        if (selectedDay.dia_semana !== currentDayName) {
            alert('Você só pode concluir exercícios do dia atual.');
            return;
        }

        try {
            setIsCompletingExercise(exerciseId);
            console.log('Marcando exercício como concluído:', exerciseId);
            await markExerciseAsCompleted(exerciseId);
            console.log('Exercício marcado como concluído com sucesso');
        } catch (error) {
            console.error("Erro ao marcar exercício como concluído:", error);
            alert("Erro ao marcar exercício como concluído. Tente novamente.");
        } finally {
            setIsCompletingExercise(null);
        }
    };
    
    const handleResetWeek = async () => {
        if (window.confirm('Tem certeza que deseja resetar o progresso da semana?')) {
            try {
                console.log('Iniciando reset da semana...');
                await resetWeekProgress();
                console.log('Reset concluído com sucesso');
                
                if (isModalOpen) {
                    setIsModalOpen(false);
                    setSelectedDay(null);
                }
            } catch (error) {
                console.error("Erro ao resetar semana:", error);
                alert("Erro ao resetar o progresso. Tente novamente.");
            }
        }
    };

    const toggleVideo = (exerciseId: string) => {
        setOpenVideoId(prevId => (prevId === exerciseId ? null : exerciseId));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Dumbbell size={48} className="animate-pulse text-blue-500 dark:text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carregando Seu Treino...</h2>
            </div>
        );
    }

    if (!workoutPlan || workoutPlan.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Zap size={48} className="text-yellow-500 dark:text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seu Plano de Treino Inteligente Aparecerá Aqui</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Parece que você ainda não tem um plano de treino. Preencha o formulário inicial para que a nossa IA crie um plano personalizado para você!
                </p>
            </div>
        );
    }

    // Estatísticas atualizadas considerando dias de descanso
    const daysWithWorkout = workoutPlan.filter(d => !isRestDay(d));
    const restDays = workoutPlan.filter(d => isRestDay(d));
    const completedDaysCount = daysWithWorkout.filter(d => d.concluido).length;
    const totalWorkoutDays = daysWithWorkout.length;
    const totalExercises = workoutPlan.reduce((acc, day) => acc + (day.exercicios_treino?.length || 0), 0);
    const totalCompletedExercises = workoutPlan.reduce((acc, day) => acc + (day.exercicios_treino?.filter(ex => ex.concluido).length || 0), 0);
    
    const iconMap: { [key: string]: React.ElementType } = { Dumbbell, Target, Zap, Award, Moon };

    return (
        <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <section className="text-center mb-12 p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Seu Treino Definitivo</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        {totalWorkoutDays > 0 ? `${totalWorkoutDays} dias de treino por semana` : 'Plano Personalizado'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-600 dark:text-green-400">
                            <Award size={16} />
                            <span><b className="text-gray-900 dark:text-white">{completedDaysCount}</b> de <b className="text-gray-900 dark:text-white">{totalWorkoutDays}</b> dias completos</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-600 dark:text-blue-400">
                            <BarChart2 size={16} />
                            <span><b className="text-gray-900 dark:text-white">{totalCompletedExercises}</b> de <b className="text-gray-900 dark:text-white">{totalExercises}</b> exercícios</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-600 dark:text-purple-400">
                            <Moon size={16} />
                            <span><b className="text-gray-900 dark:text-white">{restDays.length}</b> dias de descanso</span>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workoutPlan.map((day) => {
                        const hasWorkout = !isRestDay(day);
                        const dayIndex = orderedDays.indexOf(day.dia_semana);
                        const isPastOrCurrentDay = dayIndex <= currentDayIndex;
                        const isCurrentDay = dayIndex === currentDayIndex;
                        const DayIcon = getDayIcon(day);

                        // Lógica de cores do card
                        let cardClasses = `p-6 rounded-2xl border transition-all duration-300 relative cursor-pointer`;

                        if (day.concluido) {
                            cardClasses += ' bg-green-500/10 border-green-500/30 hover:border-green-500';
                        } else if (hasWorkout && isPastOrCurrentDay) {
                            // Dias de treino não concluídos passados ou atuais ficam vermelhos
                            cardClasses += ' bg-red-500/10 border-red-500/30 hover:border-red-500';
                        } else if (hasWorkout) {
                            // Dias de treino futuros ficam neutros
                            cardClasses += ' bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-blue-500';
                        } else {
                            // Dias de descanso têm cores neutras e hover sutil
                            cardClasses += ' bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-gray-400';
                        }

                        // Adicionar indicador de dia atual
                        if (isCurrentDay) {
                            cardClasses += ' ring-2 ring-blue-500 ring-opacity-50';
                        }

                        return (
                            <motion.div
                                key={day.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={cardClasses}
                                onClick={() => handleDayClick(day)}
                            >
                                {/* Indicador de dia atual */}
                                {isCurrentDay && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Calendar size={12} className="text-white" />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                                            {t(day.dia_semana)}
                                            {isCurrentDay && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">HOJE</span>}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">{day.nome}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                        day.concluido 
                                            ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                                            : hasWorkout 
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        <DayIcon size={24} />
                                    </div>
                                    {day.concluido && <Check className="absolute top-4 right-4 text-green-600 dark:text-green-400" size={20} />}
                                    {!isCurrentDay && hasWorkout && !day.concluido && (
                                        <Lock className="absolute top-4 right-4 text-gray-500 dark:text-gray-400" size={20} />
                                    )}
                                </div>
                                
                                {hasWorkout ? (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500 mt-6">
                                        <span><BarChart2 size={14} className="inline mr-1" /> {day.exercicios_treino?.filter(e => e.concluido).length || 0}/{day.exercicios_treino?.length || 0} feitos</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-6">
                                        <Moon size={14} />
                                        <span>Dia de descanso e recuperação</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="md:col-span-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">WG</div>
                                <span className="text-xl font-extrabold text-gray-900 dark:text-white">WebGym</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Transforme seu corpo e mente com o sistema de treinos mais completo e intuitivo.</p>
                        </div>
                        <div className="grid grid-cols-2 md:col-span-2 gap-8">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Recursos</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Vídeos dos Exercícios</a></li>
                                    <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Acompanhamento</a></li>
                                    <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Planos Personalizados</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Estatísticas</h4>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p>Exercícios Concluídos: <span className="font-bold text-gray-900 dark:text-white">{totalCompletedExercises}</span></p>
                                    <p>Dias de Treino: <span className="font-bold text-gray-900 dark:text-white">{completedDaysCount}</span></p>
                                    <p>Total de Exercícios: <span className="font-bold text-gray-900 dark:text-white">{totalExercises}</span></p>
                                    <p>Dias de Descanso: <span className="font-bold text-gray-900 dark:text-white">{restDays.length}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-500">
                        <p>© {new Date().getFullYear()} WebGym. Feito com ❤️ para transformar vidas.</p>
                    </div>
                </div>
            </footer>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDay ? `${t(selectedDay.dia_semana)} - ${selectedDay.nome}` : ''}
            >
                {selectedDay && (
                    <div className="space-y-4">
                        {isRestDay(selectedDay) ? (
                            // Conteúdo para dias de descanso
                            <div className="text-center py-8">
                                <Moon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dia de Descanso</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Este é um dia importante para a recuperação dos seus músculos. 
                                    Aproveite para descansar, se hidratar bem e ter uma boa noite de sono.
                                </p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Dicas para o dia de descanso:</h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                                        <li>• Beba pelo menos 2-3 litros de água</li>
                                        <li>• Durma pelo menos 7-8 horas</li>
                                        <li>• Faça alongamentos leves se sentir necessidade</li>
                                        <li>• Mantenha uma alimentação equilibrada</li>
                                        <li>• Evite atividades físicas intensas</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            // Conteúdo para dias de treino
                            selectedDay.exercicios_treino.map((exercise: any) => (
                                <Card key={exercise.id} className={`p-4 transition-all ${exercise.concluido ? 'border-green-500/50 bg-green-500/5' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 cursor-pointer" onClick={() => toggleVideo(exercise.id)}>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exercise.nome}</h3>
                                                <ChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${openVideoId === exercise.id ? 'rotate-180' : ''}`} />
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <span>{exercise.series} {t('sets')}</span>
                                                <span>{exercise.repeticoes} {t('reps')}</span>
                                                {exercise.descanso && <span>Descanso: {exercise.descanso}</span>}
                                            </div>
                                            {exercise.observacao && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{exercise.observacao}</p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleCompleteExercise(exercise.id)}
                                            disabled={exercise.concluido || isCompletingExercise === exercise.id || selectedDay.dia_semana !== currentDayName}
                                            icon={exercise.concluido ? Check : undefined}
                                            className={`ml-4 ${exercise.concluido 
                                                ? 'bg-green-500/20 text-green-600 dark:text-green-400 cursor-default' 
                                                : 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50'}`}
                                        >
                                            {isCompletingExercise === exercise.id 
                                                ? 'Salvando...' 
                                                : exercise.concluido 
                                                    ? t('completed') 
                                                    : t('markAsCompleted')
                                            }
                                        </Button>
                                    </div>
                                    <AnimatePresence>
                                        {openVideoId === exercise.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <VideoPlayer url={exercise.video_url} title={exercise.nome} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </Modal>

            {/* Botão de Reset */}
            <button 
                onClick={handleResetWeek}
                title="Resetar Semana"
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
            >
                <RefreshCw size={24} />
            </button>
        </div>
    );
};