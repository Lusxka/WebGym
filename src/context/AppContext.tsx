import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

// --- TIPAGENS ---

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

// Tipagem para o plano de dieta
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

// Tipagem para o estado global (com dietPlan e waterIntake)
interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  showWizard: boolean;
  loading: boolean;
  workoutPlan: WorkoutPlan[] | null;
  dietPlan: DietPlan[];
  waterIntake: { consumed: number; goal: number };
  isGeneratingPlan: boolean;
  hasCompletedProfile: boolean;
}

// Ações atualizadas para incluir dieta e água
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
  | { type: 'SET_PROFILE_COMPLETED'; payload: boolean };

// Estado inicial completo
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  showWizard: false,
  loading: true,
  workoutPlan: null,
  dietPlan: [],
  waterIntake: { consumed: 0, goal: 2000 },
  isGeneratingPlan: false,
  hasCompletedProfile: false,
};

// Reducer com a lógica para dieta e água
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
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

    const fetchUserProfile = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const createTemporaryProfile = () => {
        const temporaryProfile: UserProfile = {
          id: authUser.id,
          nome: authUser.user_metadata?.full_name || authUser.email || 'Novo Usuário',
          idade: null, 
          peso: null, 
          altura: null, 
          sexo: null, 
          objetivos: null,
          preferencias: JSON.stringify({ language: 'pt_BR' }),
          nivel: null, 
          criado_em: new Date().toISOString()
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: temporaryProfile });
        dispatch({ type: 'SET_PROFILE_COMPLETED', payload: false });
      };

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
            console.warn("Erro ao buscar perfil:", error.message);
            createTemporaryProfile();
        } else if (data) {
          const profileData = {
            ...data,
            preferencias: data.preferencias || JSON.stringify({ language: 'pt_BR' })
          };
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: profileData });
          
          const isProfileComplete = !!(data.nome && data.objetivos);
          dispatch({ type: 'SET_PROFILE_COMPLETED', payload: isProfileComplete });
        } else {
            console.log("Usuário não encontrado na base de dados");
            createTemporaryProfile();
        }
      } catch (err) {
        console.error('Falha crítica ao processar o perfil do usuário:', err);
        createTemporaryProfile();
      }
    };

    fetchUserProfile();
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
