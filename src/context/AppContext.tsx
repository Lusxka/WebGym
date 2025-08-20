import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

// Tipagens (mantive as suas principais)
export interface UserProfile {
    id: string;
    nome: string;
    preferencias: string | null;
    // ...outros campos omitidos para brevidade (mantenha os seus)
    idade?: number | null;
    peso?: number | null;
    altura?: number | null;
    sexo?: 'masculino' | 'feminino' | null;
    nivel?: 'iniciante' | 'intermediario' | 'avancado' | null;
    objetivo?: string | null;
    compartilhar_treinos?: boolean;
    compartilhar_dietas?: boolean;
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
    loading: boolean;
    workoutPlan: any[] | null;
    dietPlan: DietPlan[];
    waterIntake: { consumed: number; goal: number };
    intensiveMode: { consecutiveDays: number; intensity: 0, bestStreak: 0 };
    dailyProgress: { workout: number; diet: number };
    weeklyProgress: WeeklyProgress[];
    darkMode: boolean;
    session: any;
    showWizard: boolean; // NOVO: Estado para controlar o modal de geração de plano
    isGeneratingPlan: boolean; // NOVO: Estado para o botão de loading
}

type Action =
    | { type: 'LOGIN_SUCCESS'; payload: { userProfile: UserProfile; session: any } }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_WORKOUT_PLAN'; payload: any[] }
    | { type: 'SET_DIET_PLAN'; payload: DietPlan[] }
    | { type: 'SET_DAILY_PROGRESS'; payload: { workout: number; diet: number } }
    | { type: 'ADD_WATER'; payload: number }
    | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
    | { type: 'SET_DARK_MODE'; payload: boolean }
    | { type: 'SHOW_WIZARD'; payload: boolean }
    | { type: 'SET_IS_GENERATING_PLAN'; payload: boolean }
    | { type: 'UPDATE_USER_PROFILE'; payload: UserProfile }; // NOVO: Ação para atualizar o perfil

const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    workoutPlan: null,
    dietPlan: [],
    waterIntake: { consumed: 0, goal: 3000 },
    intensiveMode: { consecutiveDays: 0, intensity: 0, bestStreak: 0 },
    dailyProgress: { workout: 0, diet: 0 },
    weeklyProgress: [],
    darkMode: false,
    session: null,
    showWizard: false,
    isGeneratingPlan: false,
};

const getSaoPauloDate = (): Date => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcTime + -3 * 3600000);
};

const getSaoPauloDateString = (): string => {
    const d = getSaoPauloDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getSaoPauloISOString = (): string => getSaoPauloDate().toISOString();

const getNormalizedDayName = (date?: Date): string => {
    const target = date || getSaoPauloDate();
    const dayName = target.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
    switch (dayName.toLowerCase()) {
        case 'terça': return 'terca';
        case 'sábado': return 'sabado';
        default: return dayName.toLowerCase();
    }
};

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, isAuthenticated: true, user: action.payload.userProfile, session: action.payload.session };
        case 'LOGOUT':
            return { ...initialState, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_WORKOUT_PLAN':
            return { ...state, workoutPlan: action.payload };
        case 'SET_DIET_PLAN':
            return { ...state, dietPlan: action.payload };
        case 'SET_DAILY_PROGRESS':
            return { ...state, dailyProgress: { workout: action.payload.workout, diet: action.payload.diet } };
        case 'ADD_WATER':
            return { ...state, waterIntake: { ...state.waterIntake, consumed: state.waterIntake.consumed + action.payload } };
        case 'SET_DASHBOARD_DATA':
            return {
                ...state,
                dailyProgress: { workout: action.payload.workoutProgress, diet: action.payload.dietProgress },
                waterIntake: { ...state.waterIntake, consumed: action.payload.waterConsumed },
                intensiveMode: {
                    consecutiveDays: action.payload.consecutiveDays,
                    intensity: action.payload.intensity,
                    bestStreak: action.payload.bestStreak
                },
                weeklyProgress: action.payload.weeklyProgress
            };
        case 'SET_DARK_MODE':
            return { ...state, darkMode: action.payload };
        case 'SHOW_WIZARD':
            return { ...state, showWizard: action.payload };
        case 'SET_IS_GENERATING_PLAN':
            return { ...state, isGeneratingPlan: action.payload };
        case 'UPDATE_USER_PROFILE':
            return { ...state, user: { ...state.user, ...action.payload } as UserProfile };
        default:
            return state;
    }
};

type AppContextType = {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    addWater: (amount: number) => Promise<void>;
    markExerciseAsCompleted: (exerciseId: string) => Promise<void>;
    confirmMeal: (mealId: string, dayName: string) => Promise<void>;
    loadWorkoutPlansFromDB: (userId: string) => Promise<any[]>;
    loadDietPlansFromDB: (userId: string) => Promise<DietPlan[]>;
    resetWeekProgress: () => Promise<void>;
    refreshDashboardData: () => Promise<void>;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>; // NOVO: Adiciona a função
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { user: authUser, session: authSession } = useAuth();
    
    // NOVO: Adiciona a função updateUserProfile
    const updateUserProfile = async (profile: Partial<UserProfile>) => {
      try {
        if (!authUser) throw new Error('Usuário não autenticado.');
        
        console.log('Atualizando perfil do usuário:', profile);
        
        const { error } = await supabase
          .from('usuarios')
          .update(profile)
          .eq('id', authUser.id);
        
        if (error) throw error;
        
        // Atualiza o estado local após o sucesso da requisição
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: profile });
        
      } catch (err) {
        console.error('Erro ao atualizar perfil do usuário:', err);
        throw err;
      }
    };


    // --- Load workout plans (returns formatted array) ---
    const loadWorkoutPlansFromDB = async (userId: string) => {
        try {
            console.log('Carregando planos de treino para usuário:', userId);
            
            const { data, error } = await supabase
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
                console.error('Erro loadWorkoutPlansFromDB', error);
                dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
                return [];
            }

            const formatted = (data || []).map((p: any) => ({
                ...p,
                dia_semana: (p.dia_semana || '').toString().toLowerCase(),
                exercicios_treino: (p.exercicios_treino || []).map((ex: any) => ({ 
                    ...ex, 
                    concluido: !!ex.concluido 
                }))
            }));

            console.log('Planos de treino carregados:', formatted);
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: formatted });
            return formatted;
        } catch (err) {
            console.error('Erro loadWorkoutPlansFromDB:', err);
            dispatch({ type: 'SET_WORKOUT_PLAN', payload: [] });
            return [];
        }
    };

    // --- Load diet plans (returns formatted array) ---
    const loadDietPlansFromDB = async (userId: string) => {
        try {
            console.log('Carregando planos de dieta para usuário:', userId);
            
            const { data, error } = await supabase
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
                console.error('Erro loadDietPlansFromDB', error);
                dispatch({ type: 'SET_DIET_PLAN', payload: [] });
                return [];
            }

            const formatted: DietPlan[] = (data || []).map((plan: any) => ({
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

            console.log('Planos de dieta carregados:', formatted);
            dispatch({ type: 'SET_DIET_PLAN', payload: formatted });
            return formatted;
        } catch (err) {
            console.error('Erro loadDietPlansFromDB:', err);
            dispatch({ type: 'SET_DIET_PLAN', payload: [] });
            return [];
        }
    };

    // --- compute daily progress from plans (AGORA FUNCIONA) ---
    const computeAndDispatchDailyProgress = (workoutPlans: any[] = [], dietPlans: DietPlan[] = []) => {
        try {
            const today = getNormalizedDayName();
            console.log('Calculando progresso para o dia:', today);

            let workoutPercent = 0;
            const todayWorkout = (workoutPlans || []).find(p => {
                const planDay = (p.dia_semana || '').toString().toLowerCase();
                return planDay === today;
            });
            
            console.log('Treino de hoje encontrado:', todayWorkout);
            
            if (todayWorkout && todayWorkout.exercicios_treino && todayWorkout.exercicios_treino.length > 0) {
                const exercises = todayWorkout.exercicios_treino || [];
                const total = exercises.length;
                const completed = exercises.filter((e: any) => !!e.concluido).length;
                workoutPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
                console.log(`Progresso treino: ${completed}/${total} = ${workoutPercent}%`);
            } else {
                console.log('Nenhum treino encontrado para hoje ou sem exercícios');
            }

            let dietPercent = 0;
            const todayDiet = (dietPlans || []).find(d => {
                const dietDay = (d.day || '').toLowerCase();
                return dietDay === today;
            });
            
            console.log('Dieta de hoje encontrada:', todayDiet);
            
            if (todayDiet && todayDiet.meals && todayDiet.meals.length > 0) {
                const meals = todayDiet.meals || [];
                const totalMeals = meals.length;
                const confirmedMeals = meals.filter(m => !!m.confirmed).length;
                dietPercent = totalMeals > 0 ? Math.round((confirmedMeals / totalMeals) * 100) : 0;
                console.log(`Progresso dieta: ${confirmedMeals}/${totalMeals} = ${dietPercent}%`);
            } else {
                console.log('Nenhuma dieta encontrada para hoje ou sem refeições');
            }

            console.log('Despachando progresso:', { workout: workoutPercent, diet: dietPercent });
            dispatch({ type: 'SET_DAILY_PROGRESS', payload: { workout: workoutPercent, diet: dietPercent } });
            return { workoutPercent, dietPercent };
        } catch (err) {
            console.error('Erro computeAndDispatchDailyProgress', err);
            dispatch({ type: 'SET_DAILY_PROGRESS', payload: { workout: 0, diet: 0 } });
            return { workoutPercent: 0, dietPercent: 0 };
        }
    };

    // --- refresh dashboard data (REFEITO PARA SER MAIS ROBUSTO) ---
    const refreshDashboardData = async () => {
        try {
            if (!authUser) return;
            
            console.log('Refrescando dados do dashboard...');
            
            // Recarregar planos e despachar para o estado
            const [workoutPlans, dietPlans] = await Promise.all([
                loadWorkoutPlansFromDB(authUser.id),
                loadDietPlansFromDB(authUser.id)
            ]);

            // Calcular progresso
            computeAndDispatchDailyProgress(workoutPlans, dietPlans);

            console.log('Dashboard data refreshed');
        } catch (err) {
            console.error('Erro refreshDashboardData:', err);
        }
    };

    // --- mark exercise as completed (AGORA ATUALIZA O STATUS DO PLANO) ---
    const markExerciseAsCompleted = async (exerciseId: string) => {
        try {
            if (!authUser) return;
            
            console.log('Marcando exercício como concluído:', exerciseId);
            
            // 1. Marcar o exercício individual como concluído
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('exercicios_treino')
                .update({ concluido: true })
                .eq('id', exerciseId)
                .select('plano_id');
                
            if (exerciseError) throw exerciseError;

            // 2. Verificar se o plano de treino do dia está completo
            const planoId = exerciseData?.[0]?.plano_id;
            if (planoId) {
                const { data: exercisesInPlan, error: fetchError } = await supabase
                    .from('exercicios_treino')
                    .select('concluido')
                    .eq('plano_id', planoId);

                if (fetchError) throw fetchError;

                const allExercisesCompleted = exercisesInPlan?.every((e: any) => e.concluido);
                
                // 3. Se todos os exercícios estiverem concluídos, atualizar o plano principal
                if (allExercisesCompleted) {
                    console.log(`Todos os exercícios do plano ${planoId} estão concluídos. Atualizando o plano.`);
                    const { error: planError } = await supabase
                        .from('planos_treino')
                        .update({ concluido: true })
                        .eq('id', planoId);
                        
                    if (planError) throw planError;
                }
            }
            
            console.log('Exercício marcado como concluído, recarregando dados...');
            
            // Recarregar dados e recalcular progresso
            await refreshDashboardData();
            
        } catch (err) {
            console.error('markExerciseAsCompleted error', err);
            throw err;
        }
    };

    // --- confirm meal (MELHORADO) ---
    const confirmMeal = async (mealId: string, dayName: string) => {
        try {
            if (!authUser) return;
            
            console.log('Confirmando refeição:', mealId, 'para o dia:', dayName);
            
            const { error } = await supabase
                .from('refeicoes_dieta')
                .update({ confirmada: true })
                .eq('id', mealId);
                
            if (error) throw error;

            console.log('Refeição confirmada, recarregando dados...');
            
            // Recarregar dados e recalcular progresso
            await refreshDashboardData();
            
        } catch (err) {
            console.error('confirmMeal error', err);
            throw err;
        }
    };

    // --- reset week progress (MELHORADO) ---
    const resetWeekProgress = async (): Promise<void> => {
        try {
            if (!authUser) {
                console.warn('resetWeekProgress: sem usuário');
                return;
            }
            console.log('resetWeekProgress: iniciando');

            // 1) buscar ids dos planos do usuário
            const { data: plansData, error: plansError } = await supabase
                .from('planos_treino')
                .select('id')
                .eq('usuario_id', authUser.id);

            if (plansError) {
                console.error('Erro ao buscar planos para reset:', plansError);
                throw plansError;
            }

            const planIds = (plansData || []).map((p: any) => p.id).filter(Boolean);
            if (planIds.length === 0) {
                console.warn('resetWeekProgress: nenhum plano encontrado');
            } else {
                // 2) resetar exercicios_treino.concluido
                const { error: err1 } = await supabase
                    .from('exercicios_treino')
                    .update({ concluido: false })
                    .in('plano_id', planIds);

                if (err1) {
                    console.error('Erro ao resetar exercicios_treino:', err1);
                    throw err1;
                }

                // 3) opcional: resetar campo concluido dos planos
                const { error: err2 } = await supabase
                    .from('planos_treino')
                    .update({ concluido: false })
                    .in('id', planIds);

                if (err2) {
                    console.error('Erro ao resetar planos_treino:', err2);
                    throw err2;
                }
            }

            // 4) resetar refeições também
            const { data: dietPlansData } = await supabase
                .from('planos_dieta')
                .select('id')
                .eq('usuario_id', authUser.id);

            if (dietPlansData && dietPlansData.length > 0) {
                const dietPlanIds = dietPlansData.map((p: any) => p.id);
                
                const { error: err3 } = await supabase
                    .from('refeicoes_dieta')
                    .update({ confirmada: false })
                    .in('plano_id', dietPlanIds);

                if (err3) {
                    console.error('Erro ao resetar refeições:', err3);
                }
            }

            // 5) recarregar planos e recalcular progresso
            console.log('Recarregando dados após reset...');
            await refreshDashboardData();
            
            console.log('resetWeekProgress: concluído');
        } catch (err) {
            console.error('resetWeekProgress error', err);
            throw err;
        }
    };

    // --- add water ---
    const addWater = async (amount: number) => {
        if (!authUser) throw new Error('Usuário não autenticado.');
        const today = getSaoPauloDateString();
        const createdAt = getSaoPauloISOString();
        const { error } = await supabase.from('registro_agua').insert({
            usuario_id: authUser.id,
            consumido_ml: amount,
            data: today,
            criado_em: createdAt
        });
        if (error) throw error;
        dispatch({ type: 'ADD_WATER', payload: amount });
    };

    // --- initial load (login) MELHORADO ---
    useEffect(() => {
        if (!authUser) { 
            dispatch({ type: 'LOGOUT' }); 
            return; 
        }

        const fetchAll = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                // Carregar perfil do usuário
                const { data: userProfile } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();
                    
                if (!userProfile) { 
                    dispatch({ type: 'LOGOUT' }); 
                    return; 
                }
                
                dispatch({ 
                    type: 'LOGIN_SUCCESS', 
                    payload: { userProfile, session: authSession } 
                });

                // Dark mode preference
                try {
                    if (userProfile.preferencias) {
                        const prefs = JSON.parse(userProfile.preferencias);
                        if (prefs && typeof prefs.darkMode === 'boolean') {
                            dispatch({ type: 'SET_DARK_MODE', payload: prefs.darkMode });
                        }
                    }
                } catch (e) { 
                    console.warn('Erro ao carregar preferências:', e);
                }

                console.log('Iniciando carregamento dos dados do usuário...');

                // Carregar planos de treino e dieta
                const [workoutPlans, dietPlans] = await Promise.all([
                    loadWorkoutPlansFromDB(authUser.id),
                    loadDietPlansFromDB(authUser.id),
                ]);

                // Calcular progresso diário
                const { workoutPercent, dietPercent } = computeAndDispatchDailyProgress(workoutPlans, dietPlans);

                // Carregar consumo de água de hoje
                const todayISO = getSaoPauloDateString();
                const { data: waterRecords } = await supabase
                    .from('registro_agua')
                    .select('consumido_ml')
                    .eq('usuario_id', authUser.id)
                    .eq('data', todayISO);

                const totalWater = (waterRecords || []).reduce((s: number, r: any) => s + (r.consumido_ml || 0), 0);
                console.log('Água consumida hoje:', totalWater);

                // Carregar dados do modo intensivo
                const { data: intensiveModeData } = await supabase
                    .from('modo_intensivo')
                    .select('dias_consecutivos, intensidade, melhor_sequencia')
                    .eq('usuario_id', authUser.id)
                    .order('criado_em', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                console.log('Dados modo intensivo:', intensiveModeData);

                // Atualizar todos os dados no estado
                dispatch({
                    type: 'SET_DASHBOARD_DATA',
                    payload: {
                        workoutProgress: workoutPercent || 0,
                        dietProgress: dietPercent || 0,
                        waterConsumed: totalWater,
                        consecutiveDays: intensiveModeData?.dias_consecutivos || 0,
                        intensity: intensiveModeData?.intensidade || 0,
                        bestStreak: intensiveModeData?.melhor_sequencia || 0,
                        weeklyProgress: []
                    }
                });

                console.log('Dados do dashboard atualizados:', {
                    workoutProgress: workoutPercent || 0,
                    dietProgress: dietPercent || 0,
                    waterConsumed: totalWater,
                    consecutiveDays: intensiveModeData?.dias_consecutivos || 0
                });

                dispatch({ type: 'SET_LOADING', payload: false });
            } catch (error) {
                console.error('Erro ao carregar dados iniciais:', error);
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, authSession]);

    return (
        <AppContext.Provider value={{
            state,
            dispatch,
            addWater,
            markExerciseAsCompleted,
            confirmMeal,
            loadWorkoutPlansFromDB,
            loadDietPlansFromDB,
            resetWeekProgress,
            refreshDashboardData,
            updateUserProfile,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};
