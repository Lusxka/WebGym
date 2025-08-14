import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Video, Check, RefreshCw, Award, BarChart2, Zap, ChevronDown } from 'lucide-react';
// Mock imports - substitua pelos seus componentes e contexto reais
// import { useApp } from '../../context/AppContext';
// import { Card } from '../Card';
// import { Button } from '../Button';
// import { Modal } from '../Modal';
// import { VideoPlayer } from '../VideoPlayer';
// import { mockWorkouts } from '../../data/workouts';
// import { useTranslation } from '../../data/translations';

// --- INÍCIO: Mocks para demonstração (Remova e use seus imports reais) ---

// Mock do Contexto useApp
// NOTA: Adicione os links de embed do YouTube na propriedade 'videoUrl'
const mockWorkoutsData = [
  { day: 'monday', name: "Peito & Tríceps", icon: Dumbbell, completed: true, exercises: [
    { id: 'ex1', name: 'Supino Reto', sets: '4', reps: '10', completed: true, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }, 
    { id: 'ex2', name: 'Tríceps Corda', sets: '4', reps: '12', completed: true, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }
  ]},
  { day: 'tuesday', name: "Costas & Bíceps", icon: Dumbbell, completed: true, exercises: [
    { id: 'ex3', name: 'Puxada Frontal', sets: '4', reps: '10', completed: true, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }, 
    { id: 'ex4', name: 'Rosca Direta', sets: '4', reps: '12', completed: true, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }
  ]},
  { day: 'wednesday', name: "Pernas Completo", icon: Target, completed: false, exercises: [
    { id: 'ex5', name: 'Agachamento Livre', sets: '4', reps: '10', completed: true, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }, 
    { id: 'ex6', name: 'Cadeira Extensora', sets: '4', reps: '12', completed: false, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }
  ]},
  { day: 'thursday', name: "Ombros & Abdômen", icon: Zap, completed: false, exercises: [
    { id: 'ex7', name: 'Desenvolvimento', sets: '4', reps: '10', completed: false, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }, 
    { id: 'ex8', name: 'Prancha', sets: '3', reps: '60s', completed: false, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }
  ]},
  { day: 'friday', name: "Cardio & Core", icon: Award, completed: false, exercises: [
    { id: 'ex9', name: 'Corrida', sets: '1', reps: '30min', completed: false, videoUrl: 'https://www.youtube.com/embed/your_video_id_here' }
  ]},
  { day: 'saturday', name: "Descanso", icon: null, completed: false, exercises: [] },
  { day: 'sunday', name: "Descanso", icon: null, completed: false, exercises: [] },
];

const useApp = () => {
  const [state, setState] = useState({ 
    workoutPlan: mockWorkoutsData,
    user: { preferences: { language: 'pt-BR' } }
  });
  const dispatch = (action) => {
    switch(action.type) {
      case 'COMPLETE_EXERCISE': {
        const { day, exerciseId } = action.payload;
        const newPlan = state.workoutPlan.map(d => {
          if (d.day === day) {
            const newExercises = d.exercises.map(ex => ex.id === exerciseId ? { ...ex, completed: true } : ex);
            const allDayCompleted = newExercises.every(ex => ex.completed);
            return { ...d, exercises: newExercises, completed: allDayCompleted };
          }
          return d;
        });
        setState(s => ({ ...s, workoutPlan: newPlan }));
        break;
      }
      case 'RESET_WEEK': {
        const resetPlan = state.workoutPlan.map(d => ({
          ...d,
          completed: false,
          exercises: d.exercises.map(ex => ({ ...ex, completed: false }))
        }));
        setState(s => ({ ...s, workoutPlan: resetPlan }));
        break;
      }
      default:
        break;
    }
  };
  return { state, dispatch };
};

// Mock de Componentes e Funções
const Card = ({ children, className = '' }) => <div className={`bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl ${className}`}>{children}</div>;
const Button = ({ children, onClick, icon: Icon, className = '', ...props }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${className}`} {...props}>
        {Icon && <Icon size={16} />} 
        {children}
    </button>
);
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <header className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </header>
          <div className="p-6 overflow-y-auto">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
const VideoPlayer = ({ url, title }) => (
    <div className="aspect-video bg-black rounded-lg mt-4 overflow-hidden">
        <iframe
            width="100%"
            height="100%"
            src={url}
            title={`Vídeo do exercício: ${title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    </div>
);
const useTranslation = () => (key) => ({
  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
  sets: 'séries', reps: 'reps', completed: 'Concluído', markAsCompleted: 'Marcar como Concluído'
}[key] || key);

// --- FIM: Mocks para demonstração ---


export const WorkoutTab = () => {
  const { state, dispatch } = useApp();
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openVideoId, setOpenVideoId] = useState(null);
  const t = useTranslation(state.user?.preferences.language);

  const handleDayClick = (dayId) => {
    const dayWorkout = state.workoutPlan.find(d => d.day === dayId);
    if (dayWorkout && dayWorkout.exercises.length > 0) {
      setSelectedDay(dayWorkout);
      setIsModalOpen(true);
      setOpenVideoId(null); // Reseta o vídeo aberto ao abrir um novo dia
    }
  };

  const handleCompleteExercise = (exerciseId) => {
    if (selectedDay) {
      dispatch({
        type: 'COMPLETE_EXERCISE',
        payload: { day: selectedDay.day, exerciseId }
      });
      setSelectedDay(prev => {
        const newExercises = prev.exercises.map(ex => ex.id === exerciseId ? { ...ex, completed: true } : ex);
        const allDayCompleted = newExercises.every(ex => ex.completed);
        return { ...prev, exercises: newExercises, completed: allDayCompleted };
      });
    }
  };
  
  const handleResetWeek = () => {
    if (confirm('Tem certeza que deseja resetar o progresso da semana?')) {
        dispatch({ type: 'RESET_WEEK' });
    }
  }

  const toggleVideo = (exerciseId) => {
    setOpenVideoId(prevId => (prevId === exerciseId ? null : exerciseId));
  };

  // Estatísticas calculadas
  const daysWithWorkout = state.workoutPlan.filter(d => d.exercises.length > 0);
  const completedDaysCount = daysWithWorkout.filter(d => d.completed).length;
  const totalWorkoutDays = daysWithWorkout.length;
  const totalExercises = state.workoutPlan.reduce((acc, day) => acc + day.exercises.length, 0);
  const totalCompletedExercises = state.workoutPlan.reduce((acc, day) => acc + day.exercises.filter(ex => ex.completed).length, 0);

  return (
    <div className="min-h-screen font-sans bg-gray-900 text-gray-200">
      {/* Main Content - Sem o Header */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Welcome Section */}
        <section className="text-center mb-12 p-8 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Seu Treino Definitivo</h1>
            <p className="text-lg text-gray-400 mb-6">Hipertrofia & Definição com acompanhamento inteligente.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
                <Award size={16} />
                <span><b className="text-white">{completedDaysCount}</b> de <b className="text-white">{totalWorkoutDays}</b> dias completos</span>
            </div>
        </section>

        {/* Days Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.workoutPlan.map((day) => {
            const hasWorkout = day.exercises && day.exercises.length > 0;
            const DayIcon = day.icon;

            return (
              <motion.div
                key={day.day}
                whileHover={hasWorkout ? { y: -5, scale: 1.02 } : {}}
                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                  hasWorkout ? 'cursor-pointer' : 'opacity-60'
                } ${
                  day.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-gray-800/80 border-gray-700 hover:border-blue-500'
                }`}
                onClick={() => handleDayClick(day.day)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">{t(day.day)}</h3>
                    <p className="text-gray-400">{day.name}</p>
                  </div>
                  {DayIcon && (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${day.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      <DayIcon size={24} />
                    </div>
                  )}
                  {day.completed && <Check className="absolute top-4 right-4 text-green-400" size={20} />}
                </div>
                {hasWorkout && (
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-6">
                    <span><BarChart2 size={14} className="inline mr-1" /> {day.exercises.filter(e => e.completed).length}/{day.exercises.length} feitos</span>
                  </div>
                )}
                {!hasWorkout && <p className="text-gray-500 mt-6">Dia de descanso.</p>}
              </motion.div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-800 bg-gray-900/50">
          <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                  <div className="md:col-span-1">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">WG</div>
                          <span className="text-xl font-extrabold text-white">WebGym</span>
                      </div>
                      <p className="text-gray-400 text-sm">Transforme seu corpo e mente com o sistema de treinos mais completo e intuitivo.</p>
                  </div>
                  <div className="grid grid-cols-2 md:col-span-2 gap-8">
                      <div>
                          <h4 className="font-bold text-white mb-3">Recursos</h4>
                          <ul className="space-y-2 text-sm">
                              <li><a href="#" className="text-gray-400 hover:text-white">Vídeos dos Exercícios</a></li>
                              <li><a href="#" className="text-gray-400 hover:text-white">Acompanhamento</a></li>
                              <li><a href="#" className="text-gray-400 hover:text-white">Planos Personalizados</a></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-bold text-white mb-3">Estatísticas</h4>
                          <div className="space-y-2 text-sm text-gray-400">
                              <p>Exercícios Concluídos: <span className="font-bold text-white">{totalCompletedExercises}</span></p>
                              <p>Dias de Treino: <span className="font-bold text-white">{completedDaysCount}</span></p>
                              <p>Total de Exercícios: <span className="font-bold text-white">{totalExercises}</span></p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                  <p>© {new Date().getFullYear()} WebGym. Feito com ❤️ para transformar vidas.</p>
              </div>
          </div>
      </footer>

      {/* Exercise Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDay ? `${t(selectedDay.day)} - ${selectedDay.name}` : ''}
      >
        {selectedDay && (
          <div className="space-y-4">
            {selectedDay.exercises.map((exercise) => (
              <Card key={exercise.id} className={`p-4 transition-all ${exercise.completed ? 'border-green-500/50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleVideo(exercise.id)}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
                        <ChevronDown className={`text-gray-400 transition-transform ${openVideoId === exercise.id ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>{exercise.sets} {t('sets')}</span>
                      <span>{exercise.reps} {t('reps')}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCompleteExercise(exercise.id)}
                    disabled={exercise.completed}
                    icon={exercise.completed ? Check : null}
                    className={`ml-4 ${exercise.completed 
                        ? 'bg-green-500/20 text-green-400 cursor-default' 
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

      {/* FAB - Reset Button */}
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
