import { DietDay } from '../context/AppContext';

export const mockDiets: DietDay[] = [
  {
    day: 'monday',
    completed: false,
    meals: [
      {
        id: '1',
        name: 'Café da Manhã',
        description: '2 ovos mexidos + 1 fatia de pão integral + 1 banana + café',
        time: '07:00',
        calories: 350,
        confirmed: false,
      },
      {
        id: '2',
        name: 'Lanche da Manhã',
        description: '1 iogurte grego + granola',
        time: '10:00',
        calories: 180,
        confirmed: false,
      },
      {
        id: '3',
        name: 'Almoço',
        description: 'Peito de frango grelhado + arroz integral + brócolis + salada',
        time: '12:30',
        calories: 450,
        confirmed: false,
      },
      {
        id: '4',
        name: 'Lanche da Tarde',
        description: 'Shake de proteína + 1 maçã',
        time: '15:30',
        calories: 200,
        confirmed: false,
      },
      {
        id: '5',
        name: 'Jantar',
        description: 'Salmão grelhado + batata doce + aspargos',
        time: '19:00',
        calories: 400,
        confirmed: false,
      }
    ]
  }
];