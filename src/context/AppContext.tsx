import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

// --- TIPAGENS (SEU CÓDIGO ORIGINAL COMPLETO) ---

export interface UserProfile {
  id: string;
  nome: string;
  idade: number | null;
  peso: number | null;
  altura: number | null;
  sexo: 'male' | 'female' | null;
  objetivos: string | null;
  preferencias: string | null; // String JSON
  nivel: 'beginner' | 'intermediate' | 'advanced' | null;
  criado_em: string;
  avatar_url?: string;
}

export interface WorkoutPlan {
  day: string;
  name: string;
  icon: string;
  completed: boolean;
  exercises: Array<{
    id: string;
    name: string;
    sets: string;
    reps: string;
    rest: string;
    completed: boolean;
    videoUrl: string | null;
    observation: string;
  }>;
}

export interface DietPlan {
  day: string;
  meals: Array<{
    id: string;
    name: string;
    time: string;
    description: string;
    calories: number;
    confirmed: boolean;
  }>;
}

// NOVO: Tipagem para o progresso semanal
export interface WeeklyProgress {
  day: string;
  progress: number;
}

export interface DashboardData {
  workoutProgress: number;
  dietProgress: number;
  waterConsumed: number;
  consecutiveDays: number;
  intensity: number;
  bestStreak: number;
  weeklyProgress: WeeklyProgress[]; // Adiciona o progresso semanal
}

// NOVO: Adiciona 'weeklyProgress' ao estado
interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  showWizard: boolean;
  loading: boolean;
  workoutPlan: WorkoutPlan[] | null;
  dietPlan: DietPlan[];
  waterIntake: { consumed: number; goal: number };
  intensiveMode: { consecutiveDays: number; intensity: number; bestStreak: number };
  isGeneratingPlan: boolean;
  hasCompletedProfile: boolean;
  dailyProgress: {
    workout: number;
    diet: number;
  };
  weeklyProgress: WeeklyProgress[];
}

// Ações (Seu código original completo)
type Action =
  | { type: 'LOGIN_SUCCESS'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_WIZARD'; payload: boolean }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_WORKOUT_PLAN'; payload: WorkoutPlan[] }
  | { type: 'SET_DIET_PLAN'; payload: DietPlan[] }
  | { type: 'CONFIRM_MEAL'; payload: { day: string; mealId: string } }
  | { type: 'ADD_WATER'; payload: number }
  | { type: 'SET_GENERATING_PLAN'; payload: boolean }
  | { type: 'SET_PROFILE_COMPLETED'; payload: boolean }
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData };

// NOVO: Adiciona 'weeklyProgress' ao estado inicial
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  showWizard: false,
  loading: true,
  workoutPlan: null,
  dietPlan: [],
  waterIntake: { consumed: 0, goal: 3000 },
  intensiveMode: { consecutiveDays: 0, intensity: 0, bestStreak: 0 },
  isGeneratingPlan: false,
  hasCompletedProfile: false,
  dailyProgress: {
    workout: 0,
    diet: 0,
  },
  weeklyProgress: [],
};

// Reducer (Seu código original completo + atualização no SET_DASHBOARD_DATA)
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SHOW_WIZARD':
      return { ...state, showWizard: action.payload };
    case 'UPDATE_USER_PROFILE':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'SET_WORKOUT_PLAN':
      return { ...state, workoutPlan: action.payload };
    case 'SET_DIET_PLAN':
      return { ...state, dietPlan: action.payload };
    case 'CONFIRM_MEAL':
      return {
        ...state,
        dietPlan: state.dietPlan.map(dayPlan =>
          dayPlan.day === action.payload.day
            ? {
                ...dayPlan,
                meals: dayPlan.meals.map(meal =>
                  meal.id === action.payload.mealId ? { ...meal, confirmed: true } : meal
                ),
              }
            : dayPlan
        ),
      };
    case 'ADD_WATER':
      return {
        ...state,
        waterIntake: { ...state.waterIntake, consumed: state.waterIntake.consumed + action.payload },
      };
    case 'SET_GENERATING_PLAN':
      return { ...state, isGeneratingPlan: action.payload };
    case 'SET_PROFILE_COMPLETED':
      return { ...state, hasCompletedProfile: action.payload };
    
    // NOVO: Atualiza o reducer para incluir 'weeklyProgress'
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dailyProgress: {
          workout: action.payload.workoutProgress,
          diet: action.payload.dietProgress,
        },
        waterIntake: { ...state.waterIntake, consumed: action.payload.waterConsumed },
        intensiveMode: {
          consecutiveDays: action.payload.consecutiveDays,
          intensity: action.payload.intensity,
          bestStreak: action.payload.bestStreak,
        },
        weeklyProgress: action.payload.weeklyProgress,
      };
    default:
      return state;
  }
};

// Adiciona a nova função 'handleWorkoutCompletion' ao tipo do contexto
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addWater: (amount: number) => Promise<void>;
  handleWorkoutCompletion: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser } = useAuth();

  // Funções 'addWater' e 'handleWorkoutCompletion' (sem alterações)
  const addWater = async (amount: number) => { /* ... */ };
  const handleWorkoutCompletion = async () => { /* ... */ };

  useEffect(() => {
    if (!authUser) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data: userProfile } = await supabase.from('usuarios').select('*').eq('id', authUser.id).single();
      if (!userProfile) { dispatch({ type: 'LOGOUT' }); return; }
      dispatch({ type: 'LOGIN_SUCCESS', payload: userProfile });
      
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayDayName = new Date().toLocaleString('pt-BR', { weekday: 'long' }).replace('-feira', '');

      // --- LÓGICA DE CÁLCULO DE METAS ---
      const { data: allWorkoutPlans } = await supabase.from('planos_treino').select('id, dia_semana').eq('usuario_id', authUser.id);
      
      let workoutProgress = 0;
      let weeklyProgress: WeeklyProgress[] = [];
      const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

      if (allWorkoutPlans && allWorkoutPlans.length > 0) {
        const planIds = allWorkoutPlans.map(p => p.id);
        const { data: allExercises } = await supabase.from('exercicios_treino').select('plano_id, concluido').in('plano_id', planIds);

        const progressByPlanId = allWorkoutPlans.reduce((acc, plan) => {
          const exercisesForPlan = allExercises?.filter(e => e.plano_id === plan.id) ?? [];
          const completed = exercisesForPlan.filter(e => e.concluido).length;
          const total = exercisesForPlan.length;
          acc[plan.id] = total > 0 ? Math.round((completed / total) * 100) : 0;
          return acc;
        }, {} as Record<string, number>);

        weeklyProgress = weekDays.map(day => {
            const planForDay = allWorkoutPlans.find(p => p.dia_semana.toLowerCase() === day);
            return {
                day: day.charAt(0).toUpperCase() + day.slice(1),
                progress: planForDay ? progressByPlanId[planForDay.id] : 0,
            };
        });

        const todayPlan = allWorkoutPlans.find(p => p.dia_semana.toLowerCase() === todayDayName);
        if (todayPlan) {
            workoutProgress = progressByPlanId[todayPlan.id];
        }
      } else {
        // Se não houver planos, preenche a semana com 0%
        weeklyProgress = weekDays.map(day => ({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            progress: 0,
        }));
      }

      const dietProgress = 0; // Implementar fetch real

      const { data: waterRecords } = await supabase.from('registro_agua').select('consumido_ml').eq('usuario_id', authUser.id).eq('data', todayISO);
      const totalWaterConsumedToday = waterRecords?.reduce((sum, record) => sum + record.consumido_ml, 0) ?? 0;

      const { data: intensiveModeData } = await supabase.from('modo_intensivo').select('dias_consecutivos, intensidade, melhor_sequencia').eq('usuario_id', authUser.id).order('criado_em', { ascending: false }).limit(1).maybeSingle();
      
      dispatch({
        type: 'SET_DASHBOARD_DATA',
        payload: { 
            workoutProgress, 
            dietProgress, 
            waterConsumed: totalWaterConsumedToday,
            consecutiveDays: intensiveModeData?.dias_consecutivos ?? 0,
            intensity: intensiveModeData?.intensidade ?? 0,
            bestStreak: intensiveModeData?.melhor_sequencia ?? 0,
            weeklyProgress,
        },
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    };

    fetchInitialData();
  }, [authUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, addWater, handleWorkoutCompletion }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
