import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockUsers } from '../data/users';
import { mockWorkouts } from '../data/workouts';
import { mockDiets } from '../data/diets';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  level?: 'beginner' | 'intermediate' | 'advanced';
  goal?: string;
  workoutDays?: string[];
  isFirstLogin: boolean;
  preferences: {
    darkMode: boolean;
    language: 'pt_BR' | 'en_US' | 'es_ES';
    shareWorkouts: boolean;
    shareDiets: boolean;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  sets: number;
  reps: string;
  completed: boolean;
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  time: string;
  calories: number;
  confirmed: boolean;
}

export interface DietDay {
  day: string;
  meals: Meal[];
  completed: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  workoutPlan: WorkoutDay[];
  dietPlan: DietDay[];
  dailyGoals: {
    workout: number;
    diet: number;
  };
  waterIntake: {
    consumed: number;
    goal: number;
  };
  intensiveMode: {
    consecutiveDays: number;
    intensity: number;
  };
  showWizard: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_WIZARD'; payload: Partial<User> }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'COMPLETE_EXERCISE'; payload: { day: string; exerciseId: string } }
  | { type: 'CONFIRM_MEAL'; payload: { day: string; mealId: string } }
  | { type: 'ADD_WATER'; payload: number }
  | { type: 'UPDATE_INTENSIVE_MODE' }
  | { type: 'RESET_INTENSIVE_MODE' }
  | { type: 'SET_WORKOUT_PLAN'; payload: WorkoutDay[] }
  | { type: 'SET_DIET_PLAN'; payload: DietDay[] };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  workoutPlan: [],
  dietPlan: [],
  dailyGoals: {
    workout: 0,
    diet: 0,
  },
  waterIntake: {
    consumed: 0,
    goal: 2000,
  },
  intensiveMode: {
    consecutiveDays: 0,
    intensity: 0,
  },
  showWizard: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        showWizard: action.payload.isFirstLogin,
      };

    case 'LOGOUT':
      return {
        ...initialState,
      };

    case 'COMPLETE_WIZARD':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload, isFirstLogin: false } : null,
        showWizard: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'COMPLETE_EXERCISE': {
      const updatedWorkoutPlan = state.workoutPlan.map(dayPlan => {
        if (dayPlan.day === action.payload.day) {
          const updatedExercises = dayPlan.exercises.map(exercise => 
            exercise.id === action.payload.exerciseId 
              ? { ...exercise, completed: true }
              : exercise
          );
          const allCompleted = updatedExercises.every(exercise => exercise.completed);
          return { ...dayPlan, exercises: updatedExercises, completed: allCompleted };
        }
        return dayPlan;
      });

      const workoutProgress = Math.round(
        (updatedWorkoutPlan.filter(day => day.completed).length / updatedWorkoutPlan.length) * 100
      );

      return {
        ...state,
        workoutPlan: updatedWorkoutPlan,
        dailyGoals: { ...state.dailyGoals, workout: workoutProgress },
      };
    }

    case 'CONFIRM_MEAL': {
      const updatedDietPlan = state.dietPlan.map(dayPlan => {
        if (dayPlan.day === action.payload.day) {
          const updatedMeals = dayPlan.meals.map(meal => 
            meal.id === action.payload.mealId 
              ? { ...meal, confirmed: true }
              : meal
          );
          const allConfirmed = updatedMeals.every(meal => meal.confirmed);
          return { ...dayPlan, meals: updatedMeals, completed: allConfirmed };
        }
        return dayPlan;
      });

      const dietProgress = Math.round(
        (updatedDietPlan.filter(day => day.completed).length / updatedDietPlan.length) * 100
      );

      return {
        ...state,
        dietPlan: updatedDietPlan,
        dailyGoals: { ...state.dailyGoals, diet: dietProgress },
      };
    }

    case 'ADD_WATER':
      return {
        ...state,
        waterIntake: {
          ...state.waterIntake,
          consumed: Math.min(state.waterIntake.consumed + action.payload, state.waterIntake.goal),
        },
      };

    case 'UPDATE_INTENSIVE_MODE':
      return {
        ...state,
        intensiveMode: {
          consecutiveDays: state.intensiveMode.consecutiveDays + 1,
          intensity: Math.min((state.intensiveMode.consecutiveDays + 1) * 10, 100),
        },
      };

    case 'RESET_INTENSIVE_MODE':
      return {
        ...state,
        intensiveMode: {
          consecutiveDays: 0,
          intensity: 0,
        },
      };

    case 'SET_WORKOUT_PLAN':
      return {
        ...state,
        workoutPlan: action.payload,
      };

    case 'SET_DIET_PLAN':
      return {
        ...state,
        dietPlan: action.payload,
      };

    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('webgym-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.user) {
          dispatch({ type: 'LOGIN', payload: parsed.user });
          if (parsed.workoutPlan) {
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: parsed.workoutPlan });
          }
          if (parsed.dietPlan) {
            dispatch({ type: 'SET_DIET_PLAN', payload: parsed.dietPlan });
          }
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('webgym-state', JSON.stringify(state));
    } else {
      localStorage.removeItem('webgym-state');
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};