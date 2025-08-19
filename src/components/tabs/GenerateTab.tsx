// src/components/tabs/GenerateTab.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, User, Target, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card'; // Importe seus componentes reutilizáveis

// Objeto para mapear as cores às classes completas do Tailwind.
// Esta é a correção principal para evitar problemas com o Purge do Tailwind.
const colorMap = {
  blue: {
    // CORREÇÃO: Adicionando classes de modo claro
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    // CORREÇÃO: Adicionando classes de modo claro
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    // CORREÇÃO: Adicionando classes de modo claro
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
  },
  green: {
    // CORREÇÃO: Adicionando classes de modo claro
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
  },
};

export const GenerateTab = () => {
  const { dispatch, state } = useApp();

  const handleOpenWizard = () => {
    dispatch({ type: 'SHOW_WIZARD', payload: true });
  };

  const features = [
    {
      icon: User,
      title: "Perfil Personalizado",
      description: "Coletamos suas informações pessoais, físicas e de saúde para criar um plano único",
      color: "blue"
    },
    {
      icon: Target,
      title: "Objetivos Específicos",
      description: "Defina suas metas: hipertrofia, emagrecimento, resistência ou força",
      color: "purple"
    },
    {
      icon: Calendar,
      title: "Disponibilidade",
      description: "Adaptamos o plano aos seus dias disponíveis e equipamentos",
      color: "orange"
    },
    {
      icon: CheckCircle,
      title: "IA Avançada",
      description: "Nosso sistema utiliza inteligência artificial para criar o plano perfeito",
      color: "green"
    }
  ];

  return (
    // CORREÇÃO: Fundo da página principal não é alterado aqui, pois já está no DashboardPage.
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          {/* CORREÇÃO: Título com cores para os dois modos */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Gere Seu Plano Personalizado
          </h1>
          {/* CORREÇÃO: Parágrafo com cores para os dois modos */}
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Crie um plano de treino e dieta completamente personalizado para seus objetivos únicos
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            // Busca as classes de cor corretas do nosso mapa
            const colors = colorMap[feature.color] || { bg: '', text: '' };

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                // CORREÇÃO: Fundo do card e borda com cores para os dois modos
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${colors.bg}`}>
                  {/* CORREÇÃO: Cor do ícone com base no colormap */}
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                {/* CORREÇÃO: Título com cores para os dois modos */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                {/* CORREÇÃO: Descrição com cores para os dois modos */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          // CORREÇÃO: Adicionando classes de fundo para os dois modos. Mantive o gradiente no dark.
          className="bg-gray-100 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 border-2 border-gray-200 dark:border-blue-500/30 rounded-3xl p-8 text-center backdrop-blur-sm"
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            {/* CORREÇÃO: Título com cores para os dois modos */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Pronto para começar?
            </h2>
            {/* CORREÇÃO: Parágrafo com cores para os dois modos */}
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              O processo leva apenas alguns minutos e você terá um plano completo e personalizado
            </p>
          </div>

          <button
            onClick={handleOpenWizard}
            disabled={state.isGeneratingPlan}
            // CORREÇÃO: Classes de botão com cores para os dois modos
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {state.isGeneratingPlan ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Gerar Meu Plano</span>
              </>
            )}
          </button>

          {/* CORREÇÃO: Texto do footer com cores para os dois modos */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            ✨ Powered by IA • 📱 100% Personalizado • 🎯 Resultados Comprovados
          </p>
        </motion.div>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="p-4">
            {/* CORREÇÃO: Título e texto com cores para os dois modos */}
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5 min</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Tempo médio do questionário</div>
          </div>
          <div className="p-4">
            {/* CORREÇÃO: Título e texto com cores para os dois modos */}
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Personalizado para você</div>
          </div>
          <div className="p-4">
            {/* CORREÇÃO: Título e texto com cores para os dois modos */}
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Disponível a qualquer hora</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};