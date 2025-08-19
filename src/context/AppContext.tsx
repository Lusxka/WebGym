import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

// --- TIPAGENS (SEU CÓDIGO ORIGINAL - SEM ALTERAÇÕES) ---

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

export interface DashboardData {
  workoutProgress: number;
  dietProgress: number;
  waterConsumed: number;
  consecutiveDays: number;
}

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
  dailyProgress: {
    workout: number;
    diet: number;
  };
}

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
  dailyProgress: {
    workout: 0,
    diet: 0,
  },
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
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

// NOVO: Adiciona a função 'addWater' ao tipo do contexto para ser exportada
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addWater: (amount: number) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser } = useAuth();

  // NOVO: Função para registrar o consumo de água no banco de dados
  const addWater = async (amount: number) => {
    if (!state.user) {
      throw new Error("Usuário não autenticado. Não é possível registrar água.");
    }

    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('registro_agua').insert({
      usuario_id: state.user.id,
      consumido_ml: amount,
      data: today,
    });

    if (error) {
      console.error("Erro ao registrar consumo de água:", error);
      throw error; // Lança o erro para que a UI possa tratá-lo (ex: mostrar um alerta)
    }

    // Se a inserção no DB for bem-sucedida, atualiza o estado local
    dispatch({ type: 'ADD_WATER', payload: amount });
  };

  useEffect(() => {
    if (!authUser) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data: userProfile, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userProfile) {
        console.error("Erro ao buscar perfil:", userError?.message);
        dispatch({ type: 'LOGOUT' });
        return;
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: userProfile });
      const isProfileComplete = !!(userProfile.nome && userProfile.objetivos);
      dispatch({ type: 'SET_PROFILE_COMPLETED', payload: isProfileComplete });

      const today = new Date().toISOString().slice(0, 10);

      // NOVO: Busca o total de água consumido no dia de hoje no banco
      const { data: waterRecords } = await supabase
        .from('registro_agua')
        .select('consumido_ml')
        .eq('usuario_id', authUser.id)
        .eq('data', today);

      // Soma todos os registros do dia para obter o total
      const totalWaterConsumedToday = waterRecords?.reduce((sum, record) => sum + record.consumido_ml, 0) ?? 0;

      // Placeholders para as outras métricas (serão conectadas depois)
      const workoutProgress = 0;
      const dietProgress = 0;
      const consecutiveDays = 0;
      
      dispatch({
        type: 'SET_DASHBOARD_DATA',
        payload: { 
            workoutProgress, 
            dietProgress, 
            waterConsumed: totalWaterConsumedToday, // Usa o valor real do banco
            consecutiveDays 
        },
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    };

    fetchInitialData();
  }, [authUser]);

  return (
    // NOVO: Disponibiliza a função 'addWater' para todos os componentes filhos
    <AppContext.Provider value={{ state, dispatch, addWater }}>
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
