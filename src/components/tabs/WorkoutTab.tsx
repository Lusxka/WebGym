import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Video, Check, RefreshCw, Award, BarChart2, Zap, ChevronDown } from 'lucide-react';

// Imports reais dos seus componentes e contexto
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { VideoPlayer } from '../VideoPlayer';

// Mock simples para a função de tradução, substitua se tiver uma real
const useTranslation = () => (key: string) => ({
    monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
    sets: 'séries', reps: 'reps', completed: 'Concluído', markAsCompleted: 'Marcar como Concluído'
}[key] || key);


export const WorkoutTab = () => {
    const { state, dispatch } = useApp();
    const { workoutPlan } = state;

    const [selectedDay, setSelectedDay] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openVideoId, setOpenVideoId] = useState<string | null>(null);
    const t = useTranslation();

    const handleDayClick = (dayId: string) => {
        if (!workoutPlan) return;
        const dayWorkout = workoutPlan.find(d => d.day === dayId);
        if (dayWorkout && dayWorkout.exercises.length > 0) {
            setSelectedDay(dayWorkout);
            setIsModalOpen(true);
            setOpenVideoId(null);
        }
    };

    const handleCompleteExercise = (exerciseId: string) => {
        if (selectedDay) {
            // Lógica para atualizar o estado global (a ser implementada no reducer)
            // dispatch({
            //   type: 'COMPLETE_EXERCISE',
            //   payload: { day: selectedDay.day, exerciseId }
            // });
            
            // Atualização do estado local para feedback imediato
            setSelectedDay((prev: any) => {
                const newExercises = prev.exercises.map((ex: any) => ex.id === exerciseId ? { ...ex, completed: true } : ex);
                const allDayCompleted = newExercises.every((ex: any) => ex.completed);
                return { ...prev, exercises: newExercises, completed: allDayCompleted };
            });
        }
    };
    
    const handleResetWeek = () => {
        if (confirm('Tem certeza que deseja resetar o progresso da semana?')) {
            // Lógica para resetar o estado global (a ser implementada no reducer)
            // dispatch({ type: 'RESET_WEEK' });
        }
    }

    const toggleVideo = (exerciseId: string) => {
        setOpenVideoId(prevId => (prevId === exerciseId ? null : exerciseId));
    };

    // Renderização condicional se o plano não existir
    if (!workoutPlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <Zap size={48} className="text-yellow-500 dark:text-yellow-400 mb-4" />
                {/* CORREÇÃO: Cores do texto para os dois modos */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seu Plano de Treino Inteligente Aparecerá Aqui</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Parece que você ainda não tem um plano de treino. Preencha o formulário inicial para que a nossa IA crie um plano personalizado para você!
                </p>
            </div>
        );
    }

    // Estatísticas calculadas a partir do plano real
    const daysWithWorkout = workoutPlan.filter(d => d.exercises.length > 0);
    const completedDaysCount = daysWithWorkout.filter(d => d.completed).length;
    const totalWorkoutDays = daysWithWorkout.length;
    const totalExercises = workoutPlan.reduce((acc, day) => acc + day.exercises.length, 0);
    const totalCompletedExercises = workoutPlan.reduce((acc, day) => acc + day.exercises.filter(ex => ex.completed).length, 0);
    
    const iconMap: { [key: string]: React.ElementType } = { Dumbbell, Target, Zap, Award };

    return (
        // CORREÇÃO: Fundo da página e cor do texto para os dois modos
        <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500">
            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* CORREÇÃO: Fundo, borda e texto do header para os dois modos */}
                <section className="text-center mb-12 p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Seu Treino Definitivo</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Hipertrofia & Definição com acompanhamento inteligente.</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-600 dark:text-green-400">
                        <Award size={16} />
                        <span><b className="text-gray-900 dark:text-white">{completedDaysCount}</b> de <b className="text-gray-900 dark:text-white">{totalWorkoutDays}</b> dias completos</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workoutPlan.map((day) => {
                        const hasWorkout = day.exercises && day.exercises.length > 0;
                        const DayIcon = iconMap[day.icon] || Dumbbell;

                        return (
                            <motion.div
                                key={day.day}
                                whileHover={hasWorkout ? { y: -5, scale: 1.02 } : {}}
                                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                                    hasWorkout ? 'cursor-pointer' : 'opacity-60'
                                } ${
                                    day.completed 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        // CORREÇÃO: Classes para o modo claro
                                        : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                }`}
                                onClick={() => hasWorkout && handleDayClick(day.day)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        {/* CORREÇÃO: Cores do texto para os dois modos */}
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{t(day.day)}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{day.name}</p>
                                    </div>
                                    {DayIcon && (
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${day.completed ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                            <DayIcon size={24} />
                                        </div>
                                    )}
                                    {day.completed && <Check className="absolute top-4 right-4 text-green-600 dark:text-green-400" size={20} />}
                                </div>
                                {hasWorkout && (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500 mt-6">
                                        <span><BarChart2 size={14} className="inline mr-1" /> {day.exercises.filter(e => e.completed).length}/{day.exercises.length} feitos</span>
                                    </div>
                                )}
                                {!hasWorkout && <p className="text-gray-500 dark:text-gray-500 mt-6">Dia de descanso.</p>}
                            </motion.div>
                        );
                    })}
                </section>
            </main>

            {/* CORREÇÃO: Fundo do footer, borda e texto para os dois modos */}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDay ? `${t(selectedDay.day)} - ${selectedDay.name}` : ''}
            >
                {selectedDay && (
                    <div className="space-y-4">
                        {selectedDay.exercises.map((exercise: any) => (
                            // CORREÇÃO: Adicionando classes para modo claro
                            <Card key={exercise.id} className={`p-4 transition-all ${exercise.completed ? 'border-green-500/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 cursor-pointer" onClick={() => toggleVideo(exercise.id)}>
                                        <div className="flex items-center justify-between">
                                            {/* CORREÇÃO: Título com cores para os dois modos */}
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exercise.name}</h3>
                                            <ChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${openVideoId === exercise.id ? 'rotate-180' : ''}`} />
                                        </div>
                                        {/* CORREÇÃO: Descrição com cores para os dois modos */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            <span>{exercise.sets} {t('sets')}</span>
                                            <span>{exercise.reps} {t('reps')}</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleCompleteExercise(exercise.id)}
                                        disabled={exercise.completed}
                                        icon={exercise.completed ? Check : undefined}
                                        className={`ml-4 ${exercise.completed 
                                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 cursor-default' 
                                            : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                                    >
                                        {exercise.completed ? t('completed') : t('markAsCompleted')}
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
                                            <VideoPlayer url={exercise.videoUrl} title={exercise.name} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal>

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