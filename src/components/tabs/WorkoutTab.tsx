import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, Check, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { VideoPlayer } from '../VideoPlayer';
import { mockWorkouts } from '../../data/workouts';
import { useTranslation } from '../../data/translations';

export const WorkoutTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showExercises, setShowExercises] = useState(false);
  const t = useTranslation(state.user?.preferences.language);

  useEffect(() => {
    if (state.workoutPlan.length === 0) {
      dispatch({ type: 'SET_WORKOUT_PLAN', payload: mockWorkouts });
    }
  }, [state.workoutPlan.length, dispatch]);

  const days = [
    { id: 'monday', name: t('monday'), short: 'S' },
    { id: 'tuesday', name: t('tuesday'), short: 'T' },
    { id: 'wednesday', name: t('wednesday'), short: 'Q' },
    { id: 'thursday', name: t('thursday'), short: 'Q' },
    { id: 'friday', name: t('friday'), short: 'S' },
    { id: 'saturday', name: t('saturday'), short: 'S' },
    { id: 'sunday', name: t('sunday'), short: 'D' },
  ];

  const handleDayClick = (dayId: string) => {
    const dayWorkout = state.workoutPlan.find(d => d.day === dayId);
    if (dayWorkout && dayWorkout.exercises.length > 0) {
      setSelectedDay(dayId);
      setShowExercises(true);
    }
  };

  const handleCompleteExercise = (exerciseId: string) => {
    if (selectedDay) {
      dispatch({
        type: 'COMPLETE_EXERCISE',
        payload: { day: selectedDay, exerciseId }
      });
    }
  };

  const selectedWorkout = selectedDay 
    ? state.workoutPlan.find(d => d.day === selectedDay)
    : null;

  const exportWorkout = () => {
    // This would integrate with jsPDF in a real implementation
    console.log('Exporting workout to PDF...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('myWorkout')}</h1>
          <p className="text-gray-400">Selecione um dia para ver seus exercícios</p>
        </div>
        
        <Button onClick={exportWorkout} icon={Download} variant="outline">
          {t('exportWorkout')}
        </Button>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-white">Calendário Semanal</h2>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const dayWorkout = state.workoutPlan.find(d => d.day === day.id);
            const hasWorkout = dayWorkout && dayWorkout.exercises.length > 0;
            const isCompleted = dayWorkout?.completed || false;

            return (
              <motion.div
                key={day.id}
                whileHover={hasWorkout ? { scale: 1.02 } : {}}
                whileTap={hasWorkout ? { scale: 0.98 } : {}}
                className={`relative p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                  hasWorkout
                    ? isCompleted
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/50 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => hasWorkout && handleDayClick(day.id)}
              >
                <div className="text-sm font-medium mb-1">{day.short}</div>
                <div className="text-xs">{day.name}</div>
                
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <Check size={16} className="text-green-400" />
                  </div>
                )}
                
                {hasWorkout && !isCompleted && (
                  <div className="absolute top-2 right-2">
                    <Play size={16} className="text-blue-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Exercise Modal */}
      <Modal
        isOpen={showExercises}
        onClose={() => setShowExercises(false)}
        title={selectedDay ? `${t('exercises')} - ${t(selectedDay)}` : ''}
        size="xl"
      >
        {selectedWorkout && (
          <div className="space-y-6">
            {selectedWorkout.exercises.map((exercise) => (
              <Card key={exercise.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{exercise.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{exercise.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>{exercise.sets} {t('sets')}</span>
                      <span>{exercise.reps} {t('reps')}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleCompleteExercise(exercise.id)}
                    disabled={exercise.completed}
                    variant={exercise.completed ? 'secondary' : 'primary'}
                    icon={exercise.completed ? Check : undefined}
                    size="sm"
                  >
                    {exercise.completed ? t('completed') : t('markAsCompleted')}
                  </Button>
                </div>

                <VideoPlayer
                  url={exercise.videoUrl}
                  title={exercise.name}
                />
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};