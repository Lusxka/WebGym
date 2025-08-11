export const translations = {
  pt_BR: {
    // Login
    login: 'Entrar',
    email: 'E-mail',
    password: 'Senha',
    loginButton: 'Entrar',
    invalidCredentials: 'Credenciais inválidas',
    
    // Navigation
    dashboard: 'Dashboard',
    myWorkout: 'Meu Treino',
    myDiet: 'Minha Dieta',
    dailyGoals: 'Metas Diárias',
    waterGoals: 'Meta de Água',
    settings: 'Configurações',
    intensiveMode: 'Modo Intensivo',
    friends: 'Amigos',
    logout: 'Sair',
    
    // Dashboard
    welcome: 'Bem-vindo',
    workoutProgress: 'Progresso do Treino',
    dietProgress: 'Progresso da Dieta',
    waterIntake: 'Consumo de Água',
    consecutiveDays: 'Dias Consecutivos',
    
    // Workout
    exercises: 'Exercícios',
    sets: 'Séries',
    reps: 'Repetições',
    completed: 'Concluído',
    markAsCompleted: 'Marcar como Concluído',
    exportWorkout: 'Exportar Treino',
    
    // Diet
    meals: 'Refeições',
    calories: 'Calorias',
    time: 'Horário',
    confirmMeal: 'Confirmar Refeição',
    
    // Water
    addWater: 'Adicionar Água',
    waterGoal: 'Meta de Água',
    
    // Settings
    personalData: 'Dados Pessoais',
    name: 'Nome',
    age: 'Idade',
    weight: 'Peso (kg)',
    height: 'Altura (cm)',
    gender: 'Gênero',
    male: 'Masculino',
    female: 'Feminino',
    level: 'Nível',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    goal: 'Objetivo',
    workoutDays: 'Dias de Treino',
    preferences: 'Preferências',
    shareWorkouts: 'Compartilhar Treinos',
    shareDiets: 'Compartilhar Dietas',
    darkMode: 'Modo Escuro',
    language: 'Idioma',
    save: 'Salvar',
    
    // Wizard
    welcomeWizard: 'Bem-vindo ao WebGym!',
    wizardIntro: 'Vamos configurar seu perfil para criar o treino e dieta perfeitos para você.',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    
    // Days
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  },
  
  en_US: {
    // Login
    login: 'Login',
    email: 'Email',
    password: 'Password',
    loginButton: 'Login',
    invalidCredentials: 'Invalid credentials',
    
    // Navigation
    dashboard: 'Dashboard',
    myWorkout: 'My Workout',
    myDiet: 'My Diet',
    dailyGoals: 'Daily Goals',
    waterGoals: 'Water Goals',
    settings: 'Settings',
    intensiveMode: 'Intensive Mode',
    friends: 'Friends',
    logout: 'Logout',
    
    // Dashboard
    welcome: 'Welcome',
    workoutProgress: 'Workout Progress',
    dietProgress: 'Diet Progress',
    waterIntake: 'Water Intake',
    consecutiveDays: 'Consecutive Days',
    
    // Workout
    exercises: 'Exercises',
    sets: 'Sets',
    reps: 'Reps',
    completed: 'Completed',
    markAsCompleted: 'Mark as Completed',
    exportWorkout: 'Export Workout',
    
    // Diet
    meals: 'Meals',
    calories: 'Calories',
    time: 'Time',
    confirmMeal: 'Confirm Meal',
    
    // Water
    addWater: 'Add Water',
    waterGoal: 'Water Goal',
    
    // Settings
    personalData: 'Personal Data',
    name: 'Name',
    age: 'Age',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    level: 'Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    goal: 'Goal',
    workoutDays: 'Workout Days',
    preferences: 'Preferences',
    shareWorkouts: 'Share Workouts',
    shareDiets: 'Share Diets',
    darkMode: 'Dark Mode',
    language: 'Language',
    save: 'Save',
    
    // Wizard
    welcomeWizard: 'Welcome to WebGym!',
    wizardIntro: 'Let\'s set up your profile to create the perfect workout and diet for you.',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }
};

export const useTranslation = (language: 'pt_BR' | 'en_US' = 'pt_BR') => {
  return (key: string) => {
    return translations[language][key as keyof typeof translations['pt_BR']] || key;
  };
};