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
    session: any; // Adicionei a sessão ao estado para ser acessível nos componentes
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
    session: null, // Inicializando a sessão
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
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null
            };
        case 'SET_WORKOUT_PLAN':
            return { ...state, workoutPlan: action.payload };
        case 'SET_DIET_PLAN':
            return { ...state, dietPlan: action.payload };
        case 'CONFIRM_MEAL':
            return {
                ...state,
                dietPlan: state.dietPlan.map(dayPlan =>
                    dayPlan.day.toLowerCase() === action.payload.day.toLowerCase()
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
    // Novas funções para gerenciar dados do BD
    loadWorkoutPlansFromDB: () => Promise<void>;
    loadDietPlansFromDB: () => Promise<void>;
    markExerciseAsCompleted: (exerciseId: string) => Promise<void>;
    checkIfUserHasPlans: () => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { user: authUser, session: authSession } = useAuth(); // Pega a sessão do AuthContext

    // ====================================================
    // FUNÇÕES CORRIGIDAS PARA GERENCIAR DADOS DO BANCO
    // ====================================================

    const loadWorkoutPlansFromDB = async (userId: string) => {
        try {
            console.log('📋 Carregando planos de treino do banco...');
            
            // Query para buscar planos e exercícios
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
                .order('ordem', { foreignTable: 'exercicios_treino', ascending: true }); // Ordena os exercícios também

            if (error) {
                console.error('❌ Erro ao carregar planos de treino:', error);
                dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
                return;
            }

            const formattedWorkoutPlan = workoutPlans as unknown as WorkoutPlan[];
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: formattedWorkoutPlan });
            console.log('✅ Planos de treino carregados:', formattedWorkoutPlan.length, 'planos');
            
        } catch (error) {
            console.error('❌ Erro ao carregar planos de treino:', error);
        }
    };

    const loadDietPlansFromDB = async (userId: string) => {
        try {
            console.log('🥗 Carregando planos de dieta do banco...');
            
            // CORREÇÃO: Usar o nome da restrição para especificar o join
            const { data: dietPlans, error } = await supabase
                .from('planos_dieta')
                .select(`
                    id,
                    dia_semana,
                    objetivo,
                    descricao,
                    refeicoes_dieta!fk_plano_dieta (
                        id,
                        nome,
                        horario,
                        descricao,
                        calorias,
                        confirmada,
                        ordem
                    )
                `)
                .eq('usuario_id', userId)
                .order('dia_semana');

            if (error) {
                console.error('❌ Erro ao carregar planos de dieta:', error);
                dispatch({ type: 'SET_DIET_PLAN', payload: [] });
                return;
            }

            const formattedDietPlan = dietPlans as unknown as DietPlan[];
            dispatch({ type: 'SET_DIET_PLAN', payload: formattedDietPlan });
            console.log('✅ Planos de dieta carregados:', formattedDietPlan.length, 'planos');
            
        } catch (error) {
            console.error('❌ Erro ao carregar planos de dieta:', error);
        }
    };

    const markExerciseAsCompleted = async (exerciseId: string) => {
        try {
            console.log('✅ Marcando exercício como concluído:', exerciseId);
            
            const { error } = await supabase
                .from('exercicios_treino')
                .update({ 
                    concluido: true
                })
                .eq('id', exerciseId);

            if (error) {
                console.error('❌ Erro ao marcar exercício como concluído:', error);
                throw error;
            }

            // A melhor forma de atualizar o estado é recarregando os dados
            // Isso evita inconsistências de estado
            if (authUser) {
                await loadWorkoutPlansFromDB(authUser.id);
            }

            console.log('✅ Exercício marcado como concluído com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao marcar exercício como concluído:', error);
            throw error;
        }
    };

    const confirmMealFromDB = async (mealId: string, dayName: string) => {
        try {
            console.log('🍽️ Confirmando refeição:', mealId);
            
            const { error } = await supabase
                .from('refeicoes_dieta')
                .update({ 
                    confirmada: true,
                })
                .eq('id', mealId);

            if (error) {
                console.error('❌ Erro ao confirmar refeição:', error);
                throw error;
            }

            // Recarregar os dados após a alteração
            if (authUser) {
                await loadDietPlansFromDB(authUser.id);
            }

            console.log('✅ Refeição confirmada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao confirmar refeição:', error);
            throw error;
        }
    };

    const checkIfUserHasPlans = async (userId: string): Promise<boolean> => {
        try {
            console.log('🔍 Verificando se usuário tem planos...');
            
            const [workoutCheck, dietCheck] = await Promise.all([
                supabase
                    .from('planos_treino')
                    .select('id')
                    .eq('usuario_id', userId)
                    .limit(1),
                supabase
                    .from('planos_dieta')
                    .select('id')
                    .eq('usuario_id', userId)
                    .limit(1)
            ]);

            const hasWorkoutPlans = workoutCheck.data && workoutCheck.data.length > 0;
            const hasDietPlans = dietCheck.data && dietCheck.data.length > 0;
            
            console.log('📊 Planos existentes:', { 
                treino: hasWorkoutPlans, 
                dieta: hasDietPlans 
            });
            
            return hasWorkoutPlans || hasDietPlans;
            
        } catch (error) {
            console.error('❌ Erro ao verificar planos existentes:', error);
            return false;
        }
    };

    // ====================================================
    // FUNÇÕES ORIGINAIS (MANTIDAS)
    // ====================================================

    const addWater = async (amount: number) => {
        if (!state.user) throw new Error("Usuário não autenticado.");
        const today = getSaoPauloDateString();
        const createdAt = getSaoPauloISOString();
        debugTime();
        console.log('Salvando água com data:', today, 'criado_em:', createdAt);
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
        const today = getSaoPauloDate();
        today.setHours(0, 0, 0, 0);
        let newConsecutiveDays = 1;
        let newBestStreak = lastRecord?.melhor_sequencia ?? 1;
        if (lastRecord) {
            const lastRecordUTC = new Date(lastRecord.criado_em);
            const lastRecordSP = new Date(lastRecordUTC.getTime() - (3 * 3600000));
            lastRecordSP.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            console.log('DEBUG - Comparação de datas:');
            console.log('Hoje SP:', today);
            console.log('Último registro SP:', lastRecordSP);
            console.log('Ontem SP:', yesterday);
            if (lastRecordSP.getTime() === today.getTime()) {
                console.log('Já registrou hoje');
                return;
            }
            if (lastRecordSP.getTime() === yesterday.getTime()) {
                console.log('Registrou ontem, incrementando sequência');
                newConsecutiveDays = lastRecord.dias_consecutivos + 1;
            } else {
                console.log('Quebrou a sequência');
            }
        }
        if (newConsecutiveDays > newBestStreak) {
            newBestStreak = newConsecutiveDays;
        }
        const { data: newRecord, error } = await supabase
            .from('modo_intensivo')
            .insert({
                usuario_id: state.user.id,
                dias_consecutivos: newConsecutiveDays,
                melhor_sequencia: newBestStreak,
                intensidade: Math.min(100, newConsecutiveDays * 5),
                criado_em: getSaoPauloISOString()
            })
            .select()
            .single();
        if (error) {
            console.error("Erro ao atualizar modo intensivo:", error);
            throw error;
        }
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
        if (!state.user) {
            throw new Error("Usuário não autenticado.");
        }
        const { data, error } = await supabase
            .from('usuarios')
            .update(profileData)
            .eq('id', state.user.id)
            .select()
            .single();
        if (error) {
            console.log("Erro ao atualizar perfil:", error);
            throw error;
        }
        if (data) {
            dispatch({ type: 'UPDATE_USER_PROFILE', payload: data });
        }
    };

    useEffect(() => {
        // Obter a sessão e o usuário do AuthContext
        const currentSession = authSession;
        const currentUser = authUser;

        if (!currentUser) {
            dispatch({ type: 'LOGOUT' });
            return;
        }

        const fetchInitialData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            const { data: userProfile } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (!userProfile) {
                dispatch({ type: 'LOGOUT' });
                return;
            }

            dispatch({ type: 'LOGIN_SUCCESS', payload: { userProfile, session: currentSession } });

            // Pega a preferência do sistema como fallback
            let isDarkMode = getSystemTheme();
            try {
                if (userProfile.preferencias) {
                    const prefs = JSON.parse(userProfile.preferencias);
                    if (prefs && typeof prefs.darkMode === 'boolean') {
                        isDarkMode = prefs.darkMode;
                    }
                }
            } catch (e) {
                console.error("Falha ao parsear preferências do usuário", e);
            }
            dispatch({ type: 'SET_DARK_MODE', payload: isDarkMode });

            // Carregar planos após carregar dados do usuário e sessão
            await loadWorkoutPlansFromDB(currentUser.id);
            await loadDietPlansFromDB(currentUser.id);
            
            // Lógica do dashboard e outros dados (mantida)
            const todayISO = getSaoPauloDateString();
            const todayDayName = getNormalizedDayName();
            const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

            // O código a seguir é para a lógica de dashboard, não interfere no carregamento principal
            const { data: allWorkoutPlans } = await supabase
                .from('planos_treino')
                .select('id, dia_semana')
                .eq('usuario_id', currentUser.id);

            let workoutProgress = 0;
            let weeklyProgress: WeeklyProgress[] = [];

            if (allWorkoutPlans && allWorkoutPlans.length > 0) {
                const planIds = allWorkoutPlans.map(p => p.id);
                const { data: allExercises } = await supabase
                    .from('exercicios_treino')
                    .select('plano_id, concluido')
                    .in('plano_id', planIds);

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
                        progress: planForDay ? progressByPlanId[planForDay.id] : 0
                    };
                });

                const todayPlan = allWorkoutPlans.find(p => p.dia_semana.toLowerCase() === todayDayName);
                if (todayPlan) {
                    workoutProgress = progressByPlanId[todayPlan.id];
                }
            } else {
                weeklyProgress = weekDays.map(day => ({
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    progress: 0
                }));
            }

            let dietProgress = 0;
            const { data: dietPlanToday } = await supabase
                .from('planos_dieta')
                .select(`id,refeicoes_dieta (id,nome,horario,descricao,calorias,confirmada)`)
                .eq('usuario_id', currentUser.id)
                .eq('dia_semana', todayDayName)
                .maybeSingle();

            if (dietPlanToday && dietPlanToday.refeicoes_dieta) {
                const meals = dietPlanToday.refeicoes_dieta as any[];
                const totalMeals = meals.length;
                const confirmedMeals = meals.filter(m => m.confirmada).length;
                if (totalMeals > 0) {
                    dietProgress = Math.round((confirmedMeals / totalMeals) * 100);
                }
                dispatch({
                    type: 'SET_DIET_PLAN',
                    payload: [{
                        day: todayDayName,
                        meals: meals.map(m => ({ 
                            id: m.id,
                            name: m.nome, 
                            time: m.horario, 
                            description: m.descricao,
                            calories: m.calorias,
                            confirmed: m.confirmada
                        }))
                    }]
                });
            }

            const { data: waterRecords } = await supabase
                .from('registro_agua')
                .select('consumido_ml')
                .eq('usuario_id', currentUser.id)
                .eq('data', todayISO);

            const totalWaterConsumedToday = waterRecords?.reduce((sum, record) => sum + record.consumido_ml, 0) ?? 0;

            const { data: intensiveModeData } = await supabase
                .from('modo_intensivo')
                .select('dias_consecutivos, intensidade, melhor_sequencia')
                .eq('usuario_id', currentUser.id)
                .order('criado_em', { ascending: false })
                .limit(1)
                .maybeSingle();

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
                // Novas funções
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
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
