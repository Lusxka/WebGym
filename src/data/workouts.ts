import { WorkoutDay } from '../context/AppContext';

export const mockWorkouts: WorkoutDay[] = [
  {
    day: 'monday',
    completed: false,
    exercises: [
      {
        id: '1',
        name: 'Supino Reto',
        description: 'Exercício para peitorais, ombros e tríceps. Mantenha a postura correta e controle o movimento.',
        videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
        sets: 4,
        reps: '8-12',
        completed: false,
      },
      {
        id: '2',
        name: 'Agachamento',
        description: 'Exercício fundamental para pernas e glúteos. Mantenha os joelhos alinhados com os pés.',
        videoUrl: 'https://www.youtube.com/embed/YaXPRqUwItQ',
        sets: 3,
        reps: '12-15',
        completed: false,
      },
      {
        id: '3',
        name: 'Remada Curvada',
        description: 'Exercício para as costas e bíceps. Mantenha o core engajado durante todo o movimento.',
        videoUrl: 'https://www.youtube.com/embed/FWJR5Ve8bnQ',
        sets: 4,
        reps: '10-12',
        completed: false,
      }
    ]
  },
  {
    day: 'wednesday',
    completed: false,
    exercises: [
      {
        id: '4',
        name: 'Desenvolvimento de Ombros',
        description: 'Exercício para desenvolver os músculos deltoides. Mantenha o core estável.',
        videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
        sets: 3,
        reps: '10-12',
        completed: false,
      },
      {
        id: '5',
        name: 'Leg Press',
        description: 'Exercício para quadríceps, glúteos e posterior de coxa. Controle a descida.',
        videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
        sets: 4,
        reps: '12-15',
        completed: false,
      },
      {
        id: '6',
        name: 'Rosca Bíceps',
        description: 'Exercício isolado para bíceps. Evite balanços e mantenha os cotovelos fixos.',
        videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
        sets: 3,
        reps: '12-15',
        completed: false,
      }
    ]
  },
  {
    day: 'friday',
    completed: false,
    exercises: [
      {
        id: '7',
        name: 'Deadlift',
        description: 'Exercício composto para toda a cadeia posterior. Mantenha a coluna neutra.',
        videoUrl: 'https://www.youtube.com/embed/ytGaGIn3SjE',
        sets: 4,
        reps: '6-8',
        completed: false,
      },
      {
        id: '8',
        name: 'Flexão de Braços',
        description: 'Exercício funcional para peitorais, ombros e tríceps. Mantenha o corpo alinhado.',
        videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
        sets: 3,
        reps: 'Máximo possível',
        completed: false,
      },
      {
        id: '9',
        name: 'Prancha',
        description: 'Exercício isométrico para core. Mantenha o corpo em linha reta.',
        videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c',
        sets: 3,
        reps: '30-60 segundos',
        completed: false,
      }
    ]
  }
];