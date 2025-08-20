import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Video, Check, RefreshCw, Award, BarChart2, Zap, ChevronDown } from 'lucide-react';

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

export const WorkoutTab = () => {
    const { state, markExerciseAsCompleted, resetWeekProgress } = useApp();
    
    const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openVideoId, setOpenVideoId] = useState<string | null>(null);
    const [isCompletingExercise, setIsCompletingExercise] = useState<string | null>(null);
    const t = useTranslation();

    // Usar os dados do contexto diretamente
    const workoutPlan = state.workoutPlan as WorkoutDay[] | null;
    const isLoading = state.loading;

    const handleDayClick = (dayId: string) => {
        if (!workoutPlan) return;
        const dayWorkout = workoutPlan.find(d => d.dia_semana === dayId);
        if (dayWorkout && dayWorkout.exercicios_treino && dayWorkout.exercicios_treino.length > 0) {
            setSelectedDay(dayWorkout);
            setIsModalOpen(true);
            setOpenVideoId(null);
        }
    };

    const handleCompleteExercise = async (exerciseId: string) => {
        if (!selectedDay) return;
        
        try {
            setIsCompletingExercise(exerciseId);
            console.log('Marcando exercício como concluído:', exerciseId);
            
            // Usar a função do contexto que já atualiza tudo
            await markExerciseAsCompleted(exerciseId);
            
            // Atualizar o estado local do modal
            setSelectedDay((prev: any) => {
                if (!prev) return prev;
                
                const newExercises = prev.exercicios_treino.map((ex: any) => 
                    ex.id === exerciseId ? { ...ex, concluido: true } : ex
                );
                
                const allDayCompleted = newExercises.every((ex: any) => ex.concluido);
                
                return { 
                    ...prev, 
                    exercicios_treino: newExercises, 
                    concluido: allDayCompleted 
                };
            });
            
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
                
                // Fechar modal se estiver aberto
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

    // Renderização condicional para estados de carregamento e erro
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Dumbbell size={48} className="animate-pulse text-blue-500 dark:text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carregando Seu Treino...</h2>
            </div>
        );
    }

    // Renderização condicional se o plano não existir
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

    // Estatísticas calculadas a partir do plano real
    const daysWithWorkout = workoutPlan.filter(d => d.exercicios_treino && d.exercicios_treino.length > 0);
    const completedDaysCount = daysWithWorkout.filter(d => d.concluido).length;
    const totalWorkoutDays = daysWithWorkout.length;
    const totalExercises = workoutPlan.reduce((acc, day) => acc + day.exercicios_treino.length, 0);
    const totalCompletedExercises = workoutPlan.reduce((acc, day) => acc + day.exercicios_treino.filter(ex => ex.concluido).length, 0);
    
    const iconMap: { [key: string]: React.ElementType } = { Dumbbell, Target, Zap, Award };

    return (
        <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <section className="text-center mb-12 p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Seu Treino Definitivo</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{workoutPlan[0]?.objetivo || 'Treino Personalizado'}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-600 dark:text-green-400">
                        <Award size={16} />
                        <span><b className="text-gray-900 dark:text-white">{completedDaysCount}</b> de <b className="text-gray-900 dark:text-white">{totalWorkoutDays}</b> dias completos</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workoutPlan.map((day) => {
                        const hasWorkout = day.exercicios_treino && day.exercicios_treino.length > 0;
                        const DayIcon = iconMap[day.dia_semana] || Dumbbell;

                        return (
                            <motion.div
                                key={day.id}
                                whileHover={hasWorkout ? { y: -5, scale: 1.02 } : {}}
                                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                                    hasWorkout ? 'cursor-pointer' : 'opacity-60'
                                } ${
                                    day.concluido 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                }`}
                                onClick={() => hasWorkout && handleDayClick(day.dia_semana)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{t(day.dia_semana)}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{day.nome}</p>
                                    </div>
                                    {DayIcon && (
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${day.concluido ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                            <DayIcon size={24} />
                                        </div>
                                    )}
                                    {day.concluido && <Check className="absolute top-4 right-4 text-green-600 dark:text-green-400" size={20} />}
                                </div>
                                {hasWorkout && (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500 mt-6">
                                        <span><BarChart2 size={14} className="inline mr-1" /> {day.exercicios_treino.filter(e => e.concluido).length}/{day.exercicios_treino.length} feitos</span>
                                    </div>
                                )}
                                {!hasWorkout && <p className="text-gray-500 dark:text-gray-500 mt-6">Dia de descanso.</p>}
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
                        {selectedDay.exercicios_treino.map((exercise: any) => (
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
                                        disabled={exercise.concluido || isCompletingExercise === exercise.id}
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
                        ))}
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