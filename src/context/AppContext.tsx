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
    workoutPlan: any[] | null;
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
        workout: number;
        diet: number;
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
    | { type: 'SET_WORKOUT_PLAN'; payload: any[] }
    | { type: 'SET_DIET_PLAN'; payload: DietPlan[] }
    | { type: 'CONFIRM_MEAL'; payload: { day: string; mealId: string } }
    | { type: 'ADD_WATER'; payload: number }
    | { type: 'SET_GENERATING_PLAN'; payload: boolean }
    | { type: 'SET_PROFILE_COMPLETED'; payload: boolean }
    | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
    | { type: 'SET_DARK_MODE'; payload: boolean }
    | { type: 'SET_DAILY_PROGRESS'; payload: { workout: number; diet: number } };

const getSystemTheme = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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
                dailyProgress: {
                    workout: action.payload.workoutProgress,
                    diet: action.payload.dietProgress,
                },
                waterIntake: {
                    ...state.waterIntake,
                    consumed: action.payload.waterConsumed
                },
                intensiveMode: {
                    consecutiveDays: action.payload.consecutiveDays,
                    intensity: action.payload.intensity,
                    bestStreak: action.payload.bestStreak,
                },
                weeklyProgress: action.payload.weeklyProgress,
            };
        case 'SET_DARK_MODE':
            return { ...state, darkMode: action.payload };
        case 'SET_DAILY_PROGRESS':
            return { ...state, dailyProgress: { workout: action.payload.workout, diet: action.payload.diet } };
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
    loadWorkoutPlansFromDB: (userId: string) => Promise<any[]>;
    loadDietPlansFromDB: (userId: string) => Promise<DietPlan[]>;
    markExerciseAsCompleted: (exerciseId: string) => Promise<void>;
    checkIfUserHasPlans: (userId: string) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { user: authUser, session: authSession } = useAuth();

    const loadWorkoutPlansFromDB = async (userId: string) => {
        try {
            const { data: workoutPlans, error } = await supabase
                .from('planos_treino')
                .select(`
                    id,
                    nome,
                    dia_semana,
                    objetivo,
                    concluido,
                    exercicios_treino (
                        id,
                        nome,
                        ordem,
                        series,
                        repeticoes,
                        video_url,
                        descanso,
                        observacao,
                        concluido
                    )
                `)
                .eq('usuario_id', userId)
                .order('dia_semana', { ascending: true })
                .order('ordem', { foreignTable: 'exercicios_treino', ascending: true });

            if (error) {
                console.error('Erro ao carregar planos de treino:', error);
                dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
                return [];
            }

            const formatted = (workoutPlans || []).map((p: any) => ({
                ...p,
                dia_semana: (p.dia_semana || '').toString().toLowerCase(),
                exercicios_treino: (p.exercicios_treino || []).map((ex: any) => ({
                    ...ex,
                    concluido: !!ex.concluido
                }))
            }));

            dispatch({ type: 'SET_WORKOUT_PLAN', payload: formatted });
            return formatted;
        } catch (error) {
            console.error('Erro ao carregar planos de treino:', error);
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
            return [];
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

            if (error) {
                console.error('Erro ao carregar planos de dieta:', error);
                dispatch({ type: 'SET_DIET_PLAN', payload: [] });
                return [];
            }

            const formattedDietPlan: DietPlan[] = (dietPlansRaw || []).map((plan: any) => ({
                day: (plan.dia_semana || '').toString().toLowerCase(),
                meals: (plan.refeicoes_dieta || []).map((meal: any) => ({
                    id: meal.id,
                    name: meal.nome,
                    time: meal.horario,
                    description: meal.descricao,
                    calories: meal.calorias,
                    confirmed: !!meal.confirmada
                }))
            }));

            dispatch({ type: 'SET_DIET_PLAN', payload: formattedDietPlan });
            return formattedDietPlan;
        } catch (error) {
            console.error('Erro ao carregar planos de dieta:', error);
            dispatch({ type: 'SET_DIET_PLAN', payload: [] });
            return [];
        }
    };

    const computeAndDispatchDailyProgress = (workoutPlans: any[] = [], dietPlans: DietPlan[] = []) => {
        try {
            const todayDayName = getNormalizedDayName();

            // workout
            let workoutPercent = 0;
            const todayWorkout = (workoutPlans || []).find(p => (p.dia_semana || '').toString().toLowerCase() === todayDayName);
            if (todayWorkout) {
                const exercises = todayWorkout.exercicios_treino || [];
                const total = exercises.length;
                const completed = exercises.filter((e: any) => !!e.concluido).length;
                workoutPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
            }

            // diet
            let dietPercent = 0;
            const todayDiet = (dietPlans || []).find(d => (d.day || '').toLowerCase() === todayDayName);
            if (todayDiet) {
                const meals = todayDiet.meals || [];
                const totalMeals = meals.length;
                const confirmedMeals = meals.filter(m => !!m.confirmed).length;
                dietPercent = totalMeals > 0 ? Math.round((confirmedMeals / totalMeals) * 100) : 0;
            }

            // atualiza o estado reativamente
            dispatch({ type: 'SET_DAILY_PROGRESS', payload: { workout: workoutPercent, diet: dietPercent } });

            // também retorna para uso imediato (evita usar state antigo)
            return { workoutPercent, dietPercent };
        } catch (err) {
            console.error('Erro ao computar progresso diário:', err);
            return { workoutPercent: 0, dietPercent: 0 };
        }
    };

    const markExerciseAsCompleted = async (exerciseId: string) => {
        try {
            if (!authUser) return;
            const { error } = await supabase
                .from('exercicios_treino')
                .update({ concluido: true })
                .eq('id', exerciseId);

            if (error) {
                console.error('Erro ao marcar exercício como concluído:', error);
                throw error;
            }

            // Recarregar planos e recalcular progresso
            const [workoutPlans, dietPlans] = await Promise.all([
                loadWorkoutPlansFromDB(authUser.id),
                loadDietPlansFromDB(authUser.id)
            ]);

            computeAndDispatchDailyProgress(workoutPlans, dietPlans);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const confirmMealFromDB = async (mealId: string, dayName: string) => {
        try {
            if (!authUser) return;
            const { error } = await supabase
                .from('refeicoes_dieta')
                .update({ confirmada: true })
                .eq('id', mealId);

            if (error) {
                console.error('Erro ao confirmar refeição:', error);
                throw error;
            }

            // Recarregar e recalcular
            const [workoutPlans, dietPlans] = await Promise.all([
                loadWorkoutPlansFromDB(authUser.id),
                loadDietPlansFromDB(authUser.id)
            ]);

            computeAndDispatchDailyProgress(workoutPlans, dietPlans);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const checkIfUserHasPlans = async (userId: string): Promise<boolean> => {
        try {
            const [workoutCheck, dietCheck] = await Promise.all([
                supabase.from('planos_treino').select('id').eq('usuario_id', userId).limit(1),
                supabase.from('planos_dieta').select('id').eq('usuario_id', userId).limit(1)
            ]);
            return (workoutCheck.data?.length ?? 0) > 0 || (dietCheck.data?.length ?? 0) > 0;
        } catch {
            return false;
        }
    };

    const addWater = async (amount: number) => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const today = getSaoPauloDateString();
        const createdAt = getSaoPauloISOString();
        const { error } = await supabase.from('registro_agua').insert({
            usuario_id: state.user.id,
            consumido_ml: amount,
            data: today,
            criado_em: createdAt
        });
        if (error) {
            console.error("Erro ao registrar consumo de água:", error);
            throw error;
        }
        dispatch({ type: 'ADD_WATER', payload: amount });
    };

    const handleWorkoutCompletion = async () => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const { data: lastRecord } = await supabase
            .from('modo_intensivo')
            .select('dias_consecutivos, melhor_sequencia, criado_em')
            .eq('usuario_id', state.user.id)
            .order('criado_em', { ascending: false })
            .limit(1)
            .single();

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

        const { data: newRecord, error } = await supabase.from('modo_intensivo')
            .insert({
                usuario_id: state.user.id,
                dias_consecutivos: newConsecutiveDays,
                melhor_sequencia: newBestStreak,
                intensidade: Math.min(100, newConsecutiveDays * 5),
                criado_em: getSaoPauloISOString()
            }).select().single();

        if (error) throw error;

        if (newRecord) {
            // Recalcular dashboard com valores atuais de dailyProgress
            dispatch({
                type: 'SET_DASHBOARD_DATA',
                payload: {
                    workoutProgress: state.dailyProgress.workout,
                    dietProgress: state.dailyProgress.diet,
                    waterConsumed: state.waterIntake.consumed,
                    consecutiveDays: newRecord.dias_consecutivos,
                    intensity: newRecord.intensidade,
                    bestStreak: newRecord.melhor_sequencia,
                    weeklyProgress: state.weeklyProgress,
                }
            });
        }
    };

    const confirmMeal = async (mealId: string, dayName: string) => {
        await confirmMealFromDB(mealId, dayName);
    };

    const updateUserProfile = async (profileData: Partial<UserProfile>) => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const { data, error } = await supabase.from('usuarios').update(profileData).eq('id', state.user.id).select().single();
        if (error) throw error;
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
            try {
                if (userProfile.preferencias) {
                    const prefs = JSON.parse(userProfile.preferencias);
                    if (prefs && typeof prefs.darkMode === 'boolean') isDarkMode = prefs.darkMode;
                }
            } catch (e) { console.error(e); }
            dispatch({ type: 'SET_DARK_MODE', payload: isDarkMode });

            // Carregar planos
            const [workoutPlans, dietPlans] = await Promise.all([
                loadWorkoutPlansFromDB(authUser.id),
                loadDietPlansFromDB(authUser.id)
            ]);

            // CALCULA e DESPACHA daily progress e retorna os valores calculados
            const { workoutPercent, dietPercent } = computeAndDispatchDailyProgress(workoutPlans, dietPlans) as any;

            // registro de água hoje
            const todayISO = getSaoPauloDateString();
            const { data: waterRecords } = await supabase
                .from('registro_agua')
                .select('consumido_ml')
                .eq('usuario_id', authUser.id)
                .eq('data', todayISO);

            const totalWaterConsumedToday = waterRecords?.reduce((sum: number, record: any) => sum + (record.consumido_ml || 0), 0) ?? 0;

            // modo intensivo
            const { data: intensiveModeData } = await supabase
                .from('modo_intensivo')
                .select('dias_consecutivos, intensidade, melhor_sequencia')
                .eq('usuario_id', authUser.id)
                .order('criado_em', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Usa os valores calculados (não usa state antigo)
            dispatch({
                type: 'SET_DASHBOARD_DATA',
                payload: {
                    workoutProgress: workoutPercent ?? 0,
                    dietProgress: dietPercent ?? 0,
                    waterConsumed: totalWaterConsumedToday,
                    consecutiveDays: intensiveModeData?.dias_consecutivos ?? 0,
                    intensity: intensiveModeData?.intensidade ?? 0,
                    bestStreak: intensiveModeData?.melhor_sequencia ?? 0,
                    weeklyProgress: state.weeklyProgress,
                },
            });

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
                loadWorkoutPlansFromDB: (id: string) => authUser ? loadWorkoutPlansFromDB(id) : Promise.resolve([]),
                loadDietPlansFromDB: (id: string) => authUser ? loadDietPlansFromDB(id) : Promise.resolve([]),
                markExerciseAsCompleted,
                checkIfUserHasPlans: (id: string) => authUser ? checkIfUserHasPlans(id) : Promise.resolve(false)
            }}
        >
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
