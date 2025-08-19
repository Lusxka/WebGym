import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

// --- TIPAGENS (SEU CÓDIGO ORIGINAL) ---

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

// NOVO: Tipagem para os dados que o dashboard busca
export interface DashboardData {
  workoutProgress: number;
  dietProgress: number;
  waterConsumed: number;
  consecutiveDays: number;
}

// Tipagem para o estado global (seu original + 1 linha)
interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  showWizard: boolean;
  loading: boolean;
  workoutPlan: WorkoutPlan[] | null;
  dietPlan: DietPlan[];
  waterIntake: { consumed: number; goal: number };
  intensiveMode: { consecutiveDays: number; intensity: number };
  isGeneratingPlan: boolean;
  hasCompletedProfile: boolean;
  // NOVO: Adicionado para evitar o erro no DashboardTab
  dailyProgress: {
    workout: number;
    diet: number;
  };
}

// Ações (seu original + 1 linha)
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
  // NOVO: Ação para carregar os dados do dashboard
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData };

// Estado inicial completo (seu original + 1 linha)
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  showWizard: false,
  loading: true,
  workoutPlan: null,
  dietPlan: [],
  waterIntake: { consumed: 0, goal: 3000 },
  intensiveMode: { consecutiveDays: 5, intensity: 75 },
  isGeneratingPlan: false,
  hasCompletedProfile: false,
  // NOVO: Define o valor inicial para dailyProgress para corrigir o erro
  dailyProgress: {
    workout: 0,
    diet: 0,
  },
};

// Reducer (seu original + novo case)
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        // loading é tratado no useEffect para aguardar todos os dados
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SHOW_WIZARD':
        return { ...state, showWizard: action.payload };
    case 'UPDATE_USER_PROFILE':
        return {
            ...state,
            user: state.user ? { ...state.user, ...action.payload } : null,
        };
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
                  meal.id === action.payload.mealId
                    ? { ...meal, confirmed: true }
                    : meal
                ),
              }
            : dayPlan
        ),
      };
    case 'ADD_WATER':
      return {
        ...state,
        waterIntake: {
          ...state.waterIntake,
          consumed: state.waterIntake.consumed + action.payload,
        },
      };
    case 'SET_GENERATING_PLAN':
      return { ...state, isGeneratingPlan: action.payload };
    case 'SET_PROFILE_COMPLETED':
      return { ...state, hasCompletedProfile: action.payload };
    
    // NOVO: Case para lidar com a ação dos dados do dashboard
    case 'SET_DASHBOARD_DATA':
        return {
            ...state,
            dailyProgress: {
                workout: action.payload.workoutProgress,
                diet: action.payload.dietProgress,
            },
            waterIntake: {
                ...state.waterIntake,
                consumed: action.payload.waterConsumed,
            },
            intensiveMode: {
                ...state.intensiveMode,
                consecutiveDays: action.payload.consecutiveDays,
            },
        };

    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Busca perfil do usuário (lógica original melhorada)
      const { data: userProfile, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userProfile) {
        console.error("Erro ao buscar perfil:", userError?.message);
        dispatch({ type: 'LOGOUT' }); // Desloga se não encontrar perfil
        return;
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: userProfile });
      const isProfileComplete = !!(userProfile.nome && userProfile.objetivos);
      dispatch({ type: 'SET_PROFILE_COMPLETED', payload: isProfileComplete });

      // NOVO: Busca os dados do dashboard em paralelo
      // (Esta é a lógica que estávamos adicionando)
      const today = new Date().toISOString().slice(0, 10);
      const waterConsumed = 0; // Substitua com sua lógica de fetch
      const workoutProgress = 0; // Substitua com sua lógica de fetch
      const dietProgress = 0; // Substitua com sua lógica de fetch
      const consecutiveDays = 0; // Substitua com sua lógica de fetch
      
      dispatch({
        type: 'SET_DASHBOARD_DATA',
        payload: { workoutProgress, dietProgress, waterConsumed, consecutiveDays },
      });

      // Define o loading como false APÓS todos os dados serem buscados
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    fetchInitialData();
  }, [authUser]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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