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
    sexo: 'masculino' | 'feminino' | null;
    objetivo: string | null;
    compartilhar_treinos: boolean;
    compartilhar_dietas: boolean;
    preferencias: string | null;
    nivel: 'iniciante' | 'intermediario' | 'avancado' | null;
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
    weeklyProgress: WeeklyProgress[];
}

interface AppState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    showWizard: boolean;
    loading: boolean;
    workoutPlan: WorkoutPlan[] | null;
    dietPlan: DietPlan[];
    waterIntake: { consumed: number; goal: number };
    intensiveMode: {
        consecutiveDays: number;
        intensity: number;
        bestStreak: number;
    };
    isGeneratingPlan: boolean;
    hasCompletedProfile: boolean;
    dailyProgress: {
        workout: 0;
        diet: 0;
    };
    weeklyProgress: WeeklyProgress[];
    darkMode: boolean;
    session: any;
}

type Action =
    | { type: 'LOGIN_SUCCESS'; payload: { userProfile: UserProfile, session: any } }
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
    | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
    | { type: 'SET_DARK_MODE'; payload: boolean };

const getSystemTheme = (): boolean => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }
    return false;
};

const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    showWizard: false,
    loading: true,
    workoutPlan: null,
    dietPlan: [],
    waterIntake: { consumed: 0, goal: 3000 },
    intensiveMode: {
        consecutiveDays: 0,
        intensity: 0,
        bestStreak: 0
    },
    isGeneratingPlan: false,
    hasCompletedProfile: false,
    dailyProgress: {
        workout: 0,
        diet: 0,
    },
    weeklyProgress: [],
    darkMode: getSystemTheme(),
    session: null,
};

const getSaoPauloDate = (): Date => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const saoPauloTime = new Date(utcTime + (-3 * 3600000));
    return saoPauloTime;
};

const getSaoPauloDateString = (): string => {
    const date = getSaoPauloDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getSaoPauloISOString = (): string => {
    const date = getSaoPauloDate();
    return date.toISOString();
};

const debugTime = () => {
    console.log('=== DEBUG HORÁRIO ===');
    console.log('Hora local sistema:', new Date().toLocaleString());
    console.log('Hora UTC:', new Date().toISOString());
    console.log('Hora SP calculada:', getSaoPauloDate().toLocaleString());
    console.log('Data SP:', getSaoPauloDateString());
    console.log('ISO SP:', getSaoPauloISOString());
};

const getNormalizedDayName = (date?: Date): string => {
    const targetDate = date || getSaoPauloDate();
    const dayName = targetDate.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
    switch (dayName.toLowerCase()) {
        case 'terça': return 'terca';
        case 'sábado': return 'sabado';
        default: return dayName.toLowerCase();
    }
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, isAuthenticated: true, user: action.payload.userProfile, session: action.payload.session };
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
                    dayPlan.day.toLowerCase() === action.payload.day.toLowerCase()
                        ? { ...dayPlan, meals: dayPlan.meals.map(meal => meal.id === action.payload.mealId ? { ...meal, confirmed: true } : meal) }
                        : dayPlan
                ),
            };
        case 'ADD_WATER':
            return { ...state, waterIntake: { ...state.waterIntake, consumed: state.waterIntake.consumed + action.payload } };
        case 'SET_GENERATING_PLAN':
            return { ...state, isGeneratingPlan: action.payload };
        case 'SET_PROFILE_COMPLETED':
            return { ...state, hasCompletedProfile: action.payload };
        case 'SET_DASHBOARD_DATA':
            return {
                ...state,
                dailyProgress: { workout: action.payload.workoutProgress, diet: action.payload.dietProgress },
                waterIntake: { ...state.waterIntake, consumed: action.payload.waterConsumed },
                intensiveMode: {
                    consecutiveDays: action.payload.consecutiveDays,
                    intensity: action.payload.intensity,
                    bestStreak: action.payload.bestStreak,
                },
                weeklyProgress: action.payload.weeklyProgress,
            };
        case 'SET_DARK_MODE':
            return { ...state, darkMode: action.payload };
        default:
            return state;
    }
};

type AppContextType = {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    addWater: (amount: number) => Promise<void>;
    handleWorkoutCompletion: () => Promise<void>;
    confirmMeal: (mealId: string, dayName: string) => Promise<void>;
    updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
    loadWorkoutPlansFromDB: () => Promise<void>;
    loadDietPlansFromDB: () => Promise<void>;
    markExerciseAsCompleted: (exerciseId: string) => Promise<void>;
    checkIfUserHasPlans: () => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { user: authUser, session: authSession } = useAuth();

    // ====================================================
    // FUNÇÕES BANCO
    // ====================================================

    const loadWorkoutPlansFromDB = async (userId: string) => {
        try {
            const { data: workoutPlans, error } = await supabase
                .from('planos_treino')
                .select(`id,nome,dia_semana,objetivo,concluido,exercicios_treino(id,nome,ordem,series,repeticoes,video_url,descanso,observacao,concluido)`)
                .eq('usuario_id', userId)
                .order('dia_semana', { ascending: true })
                .order('ordem', { foreignTable: 'exercicios_treino', ascending: true });

            if (error) { dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] }); return; }

            dispatch({ type: 'SET_WORKOUT_PLAN', payload: workoutPlans as unknown as WorkoutPlan[] });
        } catch (error) {
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
        }
    };

    const loadDietPlansFromDB = async (userId: string) => {
        try {
            const { data: dietPlansRaw, error } = await supabase
                .from('planos_dieta')
                .select(`
                    id,
                    dia_semana,
                    refeicoes_dieta!fk_plano_dieta (
                        id,
                        nome,
                        horario,
                        descricao,
                        calorias,
                        confirmada
                    )
                `)
                .eq('usuario_id', userId)
                .order('dia_semana');

            if (error) { dispatch({ type: 'SET_DIET_PLAN', payload: [] }); return; }

            const formattedDietPlan: DietPlan[] = (dietPlansRaw || []).map(plan => ({
                day: plan.dia_semana.toLowerCase(),
                meals: (plan.refeicoes_dieta || []).map(meal => ({
                    id: meal.id,
                    name: meal.nome,
                    time: meal.horario,
                    description: meal.descricao,
                    calories: meal.calorias,
                    confirmed: meal.confirmada
                }))
            }));

            dispatch({ type: 'SET_DIET_PLAN', payload: formattedDietPlan });
        } catch (error) {
            dispatch({ type: 'SET_DIET_PLAN', payload: [] });
        }
    };

    const markExerciseAsCompleted = async (exerciseId: string) => {
        if (!authUser) return;
        await supabase.from('exercicios_treino').update({ concluido: true }).eq('id', exerciseId);
        await loadWorkoutPlansFromDB(authUser.id);
    };

    const confirmMealFromDB = async (mealId: string, dayName: string) => {
        if (!authUser) return;
        await supabase.from('refeicoes_dieta').update({ confirmada: true }).eq('id', mealId);
        await loadDietPlansFromDB(authUser.id);
    };

    const checkIfUserHasPlans = async (userId: string): Promise<boolean> => {
        try {
            const [workoutCheck, dietCheck] = await Promise.all([
                supabase.from('planos_treino').select('id').eq('usuario_id', userId).limit(1),
                supabase.from('planos_dieta').select('id').eq('usuario_id', userId).limit(1)
            ]);
            return (workoutCheck.data?.length ?? 0) > 0 || (dietCheck.data?.length ?? 0) > 0;
        } catch { return false; }
    };

    // ====================================================
    // FUNÇÕES ORIGINAIS
    // ====================================================

    const addWater = async (amount: number) => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const today = getSaoPauloDateString();
        const createdAt = getSaoPauloISOString();
        await supabase.from('registro_agua').insert({
            usuario_id: state.user.id,
            consumido_ml: amount,
            data: today,
            criado_em: createdAt
        });
        dispatch({ type: 'ADD_WATER', payload: amount });
    };

    const handleWorkoutCompletion = async () => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const { data: lastRecord } = await supabase.from('modo_intensivo')
            .select('dias_consecutivos, melhor_sequencia, criado_em')
            .eq('usuario_id', state.user.id)
            .order('criado_em', { ascending: false }).limit(1).single();

        const today = getSaoPauloDate(); today.setHours(0, 0, 0, 0);
        let newConsecutiveDays = 1;
        let newBestStreak = lastRecord?.melhor_sequencia ?? 1;

        if (lastRecord) {
            const lastRecordSP = new Date(new Date(lastRecord.criado_em).getTime() - (3 * 3600000));
            lastRecordSP.setHours(0, 0, 0, 0);
            const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

            if (lastRecordSP.getTime() === today.getTime()) return;
            if (lastRecordSP.getTime() === yesterday.getTime()) newConsecutiveDays = lastRecord.dias_consecutivos + 1;
        }
        if (newConsecutiveDays > newBestStreak) newBestStreak = newConsecutiveDays;

        const { data: newRecord } = await supabase.from('modo_intensivo')
            .insert({
                usuario_id: state.user.id,
                dias_consecutivos: newConsecutiveDays,
                melhor_sequencia: newBestStreak,
                intensidade: Math.min(100, newConsecutiveDays * 5),
                criado_em: getSaoPauloISOString()
            }).select().single();

        if (newRecord) {
            dispatch({
                type: 'SET_DASHBOARD_DATA',
                payload: {
                    workoutProgress: state.dailyProgress.workout,
                    dietProgress: state.dailyProgress.diet,
                    waterConsumed: state.waterIntake.consumed,
                    consecutiveDays: newRecord.dias_consecutivos,
                    intensity: newRecord.intensidade,
                    bestStreak: newRecord.melhor_sequencia,
                    weeklyProgress: state.weeklyProgress
                }
            });
        }
    };

    const confirmMeal = async (mealId: string, dayName: string) => {
        await confirmMealFromDB(mealId, dayName);
    };

    const updateUserProfile = async (profileData: Partial<UserProfile>) => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const { data } = await supabase.from('usuarios').update(profileData).eq('id', state.user.id).select().single();
        if (data) dispatch({ type: 'UPDATE_USER_PROFILE', payload: data });
    };

    useEffect(() => {
        if (!authUser) { dispatch({ type: 'LOGOUT' }); return; }
        const fetchInitialData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            const { data: userProfile } = await supabase.from('usuarios').select('*').eq('id', authUser.id).single();
            if (!userProfile) { dispatch({ type: 'LOGOUT' }); return; }
            dispatch({ type: 'LOGIN_SUCCESS', payload: { userProfile, session: authSession } });

            let isDarkMode = getSystemTheme();
            try { if (userProfile.preferencias) { const prefs = JSON.parse(userProfile.preferencias); if (prefs?.darkMode) isDarkMode = prefs.darkMode; } } catch {}
            dispatch({ type: 'SET_DARK_MODE', payload: isDarkMode });

            await loadWorkoutPlansFromDB(authUser.id);
            await loadDietPlansFromDB(authUser.id);

            dispatch({ type: 'SET_LOADING', payload: false });
        };
        fetchInitialData();
    }, [authUser, authSession]);

    return (
        <AppContext.Provider
            value={{
                state,
                dispatch,
                addWater,
                handleWorkoutCompletion,
                confirmMeal,
                updateUserProfile,
                loadWorkoutPlansFromDB: () => authUser ? loadWorkoutPlansFromDB(authUser.id) : Promise.resolve(),
                loadDietPlansFromDB: () => authUser ? loadDietPlansFromDB(authUser.id) : Promise.resolve(),
                markExerciseAsCompleted,
                checkIfUserHasPlans: () => authUser ? checkIfUserHasPlans(authUser.id) : Promise.resolve(false)
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};
