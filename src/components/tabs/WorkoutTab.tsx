import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dumbbell, Target, Video, Check, RefreshCw, Award, BarChart2, Zap,
    ChevronDown, Lock, Moon, Stars, Calendar
} from 'lucide-react';

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
    dia_semana: string; // ex: 'segunda', 'terca', ...
    objetivo: string | null;
    concluido: boolean;
    exercicios_treino: Exercise[];
    // opcional: data de geração por dia (caso seu backend forneça por dia)
    generated_at?: string | null;
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

    // Ordered days mapping (domingo = 0 ... sabado = 6)
    const orderedDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    // Data de hoje (início do dia)
    const todayStart = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Determina a data de geração do plano:
    // Prioriza state.workoutGeneratedAt -> fallback para workoutPlan[0].generated_at -> null
    const generationDateStr: string | null | undefined = (state as any).workoutGeneratedAt || workoutPlan?.[0]?.generated_at || null;
    const generationDate: Date | null = useMemo(() => {
        if (!generationDateStr) return null;
        const d = new Date(generationDateStr);
        if (isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    }, [generationDateStr]);

    // Helper: converte nome do dia ('segunda') para índice 0..6 (domingo..sabado)
    const weekdayNameToIndex = (name: string) => {
        if (!name) return -1;
        const n = name.toLowerCase();
        return orderedDays.indexOf(n);
    };

    // Helper: dado um startDate (data) e um targetWeekdayIndex (0..6), retorna a primeira ocorrência
    // desse weekday **a partir** do startDate (inclui startDate caso coincida).
    const getFirstOccurrenceDate = (startDate: Date, targetWeekdayIndex: number): Date => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const startIndex = start.getDay(); // 0..6 (domingo..sabado)
        const diff = (targetWeekdayIndex - startIndex + 7) % 7;
        const result = new Date(start);
        result.setDate(start.getDate() + diff);
        result.setHours(0, 0, 0, 0);
        return result;
    };

    // Se não houver generationDate, usamos a semana atual como base (a partir de hoje)
    const baseDateForScheduling = generationDate || todayStart;

    // Helper: dada uma WorkoutDay retorna a Data agendada (a primeira ocorrência a partir da baseDateForScheduling)
    const getScheduledDateForDay = (day: WorkoutDay | null | undefined): Date | null => {
        if (!day) return null;
        const idx = weekdayNameToIndex(day.dia_semana || '');
        if (idx < 0) return null;
        return getFirstOccurrenceDate(baseDateForScheduling, idx);
    };

    // Obtém o dia atual em nome normalizado (para compatibilidade com seu código existente)
    const currentDayName = getNormalizedDayName();
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

        // botão só conclui exercícios se o dia selecionado for o dia agendado para hoje
        const scheduledForSelected = getScheduledDateForDay(selectedDay);
        if (!scheduledForSelected || scheduledForSelected.getTime() !== todayStart.getTime()) {
            alert('Você só pode concluir exercícios do dia agendado para hoje.');
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

    // Gera um array de objetos para as estrelas com propriedades aleatórias
    const totalStars = 20;
    const starPositions = useMemo(() => Array.from({ length: totalStars }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 4 + 3}s`,
        size: `${Math.random() * 2 + 1}px`
    })), [totalStars]);

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

    // data agendada para o day selecionado (usado no modal para habilitar botão)
    const scheduledDateForSelectedDay = useMemo(() => getScheduledDateForDay(selectedDay || undefined), [selectedDay, generationDate, workoutPlan]);

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

                        // Data agendada para este dia (a primeira ocorrência a partir da data de geração / base)
                        const scheduledDate = getScheduledDateForDay(day);

                        // se scheduledDate existe e é antes de hoje => dia passado (possível "perdido")
                        const isPastScheduledDate = !!scheduledDate && scheduledDate.getTime() < todayStart.getTime();

                        // é o dia agendado para hoje?
                        const isCurrentDay = !!scheduledDate && scheduledDate.getTime() === todayStart.getTime();

                        // Determinar o tipo do card baseado nas condições
                        let cardType = 'neutral';
                        
                        if (!hasWorkout) {
                            cardType = 'rest';
                        } else if (day.concluido) {
                            cardType = 'completed';
                        } else if (isPastScheduledDate) {
                            cardType = 'overdue';
                        } else {
                            cardType = 'upcoming';
                        }

                        let cardClasses = `p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer`;

                        switch (cardType) {
                            case 'rest':
                                cardClasses += ' bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/30 hover:border-indigo-300 dark:hover:border-indigo-600';
                                break;
                            case 'completed':
                                cardClasses += ' bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/30';
                                break;
                            case 'overdue':
                                cardClasses += ' bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50 dark:border-red-700/30 hover:border-red-400 dark:hover:border-red-600';
                                break;
                            case 'upcoming':
                                cardClasses += ' bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/30 hover:border-blue-400 dark:hover:border-blue-600';
                                break;
                            default:
                                cardClasses += ' bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-gray-400';
                        }

                        if (isCurrentDay) {
                            cardClasses += ' ring-2 ring-blue-500 ring-opacity-50';
                        }

                        const DayIcon = getDayIcon(day);

                        return (
                            <div
                                key={day.id}
                                className={cardClasses}
                                onClick={() => handleDayClick(day)}
                                style={{
                                    transform: 'translateY(0)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                }}
                            >
                                {!hasWorkout && (
                                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                                        <div className="absolute top-4 right-4 text-indigo-600 dark:text-indigo-400">
                                            <Moon size={32} />
                                        </div>
                                        <div className="stars-container">
                                            {starPositions.map((style, index) => (
                                                <span 
                                                    key={index}
                                                    className="star" 
                                                    style={{ 
                                                        top: style.top, 
                                                        left: style.left,
                                                        animationDelay: style.animationDelay,
                                                        animationDuration: style.animationDuration,
                                                        width: style.size,
                                                        height: style.size,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                        {/* Apenas o nome do treino é mantido, o texto de descanso foi removido */}
                                        <p className="text-gray-600 dark:text-gray-400">{day.nome}</p>
                                    </div>
                                    
                                    {hasWorkout ? (
                                        <div 
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                day.concluido 
                                                    ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                                                    : cardType === 'overdue'
                                                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                }`}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'rotate(-10deg)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'rotate(0deg)';
                                            }}
                                        >
                                            <Dumbbell size={24} />
                                        </div>
                                    ) : (
                                        <div 
                                            className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                            style={{
                                                animation: 'gentle-float 4s ease-in-out infinite'
                                            }}
                                        >
                                            <Moon size={24} />
                                        </div>
                                    )}
                                    
                                    {day.concluido && (
                                        <div
                                            className="absolute top-4 right-4 transition-all duration-300"
                                            style={{
                                                animation: 'check-appear 0.3s ease-out'
                                            }}
                                        >
                                            <Check className="text-green-600 dark:text-green-400" size={20} />
                                        </div>
                                    )}
                                    {!isCurrentDay && hasWorkout && !day.concluido && (
                                        <Lock className="absolute top-4 right-4 text-gray-500 dark:text-gray-400" size={20} />
                                    )}
                                </div>

                                {hasWorkout ? (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500 mt-6">
                                        <span><BarChart2 size={14} className="inline mr-1" /> {day.exercicios_treino?.filter(e => e.concluido).length || 0}/{day.exercicios_treino?.length || 0} feitos</span>
                                    </div>
                                ) : (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                            <Stars size={16} />
                                            <span className="font-medium">Dia de Descanso</span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Momento para recuperação e regeneração muscular.
                                            Aproveite para recarregar as energias.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            </main>

            <style jsx>{`
                @keyframes gentle-float {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(5deg) scale(1.05); }
                    75% { transform: rotate(-5deg) scale(1.05); }
                }
                
                @keyframes check-appear {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes star-fall {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(20px) rotate(360deg) scale(0.8);
                        opacity: 0;
                    }
                }

                .stars-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                }

                .star {
                    position: absolute;
                    background: #FBBF24;
                    border-radius: 50%;
                    box-shadow: 0 0 5px #FBBF24;
                    animation-name: star-fall;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }
            `}</style>

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
                            selectedDay.exercicios_treino.map((exercise: any) => {
                                const scheduledForSelected = scheduledDateForSelectedDay;
                                const canComplete = !!scheduledForSelected && scheduledForSelected.getTime() === todayStart.getTime();

                                return (
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
                                                disabled={exercise.concluido || isCompletingExercise === exercise.id || !canComplete}
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
                                );
                            })
                        )}
                    </div>
                )}
            </Modal>

            {/* Botão de Reset */}
            <button
                onClick={handleResetWeek}
                title="Resetar Semana"
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-40 transition-all duration-200 hover:scale-110 active:scale-95"
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(180deg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
            >
                <RefreshCw size={24} />
            </button>
        </div>
    );
};