// Arquivo: src/pages/DashboardPage.tsx

import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, Target, TrendingUp, Droplets, Sparkles, Calendar, Zap } from 'lucide-react';

// --- Componentes de Card para Reutilização (boa prática) ---

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  percentage: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, percentage, color }) => (
  <div className="bg-gray-800 p-6 rounded-lg flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="text-gray-400 font-medium">{title}</span>
      <Icon className="text-gray-500" size={20} />
    </div>
    <div>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full`} 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  details: string;
  detailsColor?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, details, detailsColor = 'text-blue-400' }) => (
  <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
    <h4 className="font-semibold text-white mb-1">{title}</h4>
    <p className="text-gray-400 mb-4">{description}</p>
    <p className={`font-medium ${detailsColor}`}>{details}</p>
  </div>
);


// --- Componente principal da página do Dashboard ---

export const DashboardPage: React.FC = () => {
  const { state } = useApp();
  const userName = state.user?.name || 'Usuário';

  return (
    // Note que não há mais a estrutura de tela cheia, sidebar ou header.
    // Apenas o conteúdo que vai dentro do <main>.
    <div className="animate-fade-in"> {/* Animação sutil de entrada */}
      {/* Cabeçalho de Boas-Vindas */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Bem-vindo, {userName}! 👋</h1>
        <p className="text-gray-400 mt-2">Continue sua jornada fitness com determinação!</p>
      </div>

      {/* Seção de Status (Cards de Progresso) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={TrendingUp} 
          title="Progresso do Treino" 
          value="0%" 
          percentage={0} 
          color="#3b82f6" // Azul
        />
        <StatCard 
          icon={Target} 
          title="Progresso da Dieta" 
          value="0%" 
          percentage={0} 
          color="#22c55e" // Verde
        />
        <StatCard 
          icon={Droplets} 
          title="Consumo de Água" 
          value="0ml" 
          percentage={0}
          color="#0ea5e9" // Ciano
        />
        <StatCard 
          icon={Sparkles} 
          title="Dias Consecutivos" 
          value="0" 
          percentage={0}
          color="#f97316" // Laranja
        />
      </div>

      {/* Seção de Ações Rápidas */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard 
            title="Próximo Treino"
            description="Segunda-feira"
            details="Treino A - Peito e Tríceps"
          />
          <ActionCard 
            title="Meta do Dia"
            description="Água restante"
            details="2000ml"
            detailsColor="text-cyan-400"
          />
          <ActionCard 
            title="Streak Atual"
            description="Dias consecutivos"
            details="0 dias"
            detailsColor="text-orange-400"
          />
        </div>
      </div>
    </div>
  );
};

// É uma boa prática adicionar `default` na exportação de páginas
export default DashboardPage;