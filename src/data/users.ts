export const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    password: '123456',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
    age: 28,
    weight: 75,
    height: 175,
    gender: 'male' as const,
    level: 'intermediate' as const,
    goal: 'Ganho de massa muscular',
    workoutDays: ['monday', 'wednesday', 'friday'],
    isFirstLogin: false,
    preferences: {
      darkMode: true,
      language: 'pt_BR' as const,
      shareWorkouts: true,
      shareDiets: false,
    }
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: '123456',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
    isFirstLogin: true,
    preferences: {
      darkMode: true,
      language: 'pt_BR' as const,
      shareWorkouts: false,
      shareDiets: false,
    }
  }
];