import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { useTranslation } from '../../data/translations';
import { supabase } from '../../supabase';

interface WaterHistoryEntry {
  criado_em: string;
  consumido_ml: number;
}

// CORREÇÃO: Funções mais robustas para fuso horário de São Paulo (UTC-3)
const getSaoPauloDate = (): Date => {
  // Pega a hora atual em UTC e subtrai 3 horas para SP (UTC-3)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const saoPauloTime = new Date(utcTime + (-3 * 3600000)); // UTC-3
  return saoPauloTime;
};

const getSaoPauloDateString = (): string => {
  const date = getSaoPauloDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const WaterTab: React.FC = () => {
  const { state, addWater } = useApp();
  const t = useTranslation(state.user?.preferences?.language);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<WaterHistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!state.user) return;

      // CORREÇÃO: Usa a função padronizada para obter a data de São Paulo
      const todayISO = getSaoPauloDateString();

      const { data, error } = await supabase
        .from('registro_agua')
        .select('criado_em, consumido_ml')
        .eq('usuario_id', state.user.id)
        .eq('data', todayISO)
        .order('criado_em', { ascending: true });

      if (error) {
        console.error("Erro ao buscar histórico de água:", error);
      } else if (data) {
        setHistory(data);
      }
    };

    fetchHistory();
  }, [state.user, state.waterIntake.consumed]);

  const handleAddWater = async (amount: number) => {
    setIsLoading(true);
    try {
      await addWater(amount);
    } catch (error) {
      alert('Não foi possível registrar o consumo. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const consumed = state.waterIntake?.consumed ?? 0;
  const goal = state.waterIntake?.goal || 3000; // Valor padrão corrigido
  const progressPercentage = (consumed / goal) * 100;
  const remainingWater = Math.max(0, goal - consumed);
  const quickAmounts = [250, 500, 750, 1000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('waterGoals')}</h1>
        <p className="text-gray-400">Mantenha-se hidratado ao longo do dia</p>
      </div>

      {/* Card principal com a animação da água */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <motion.div
            initial={false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-32 h-32 mx-auto mb-6 relative"
          >
            <div className="w-full h-full rounded-full border-8 border-gray-600 relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-blue-500"
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="text-white w-12 h-12" />
              </div>
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">{consumed}ml</h2>
          <p className="text-gray-400">
            de {goal}ml ({Math.round(progressPercentage)}%)
          </p>
        </div>
        <ProgressBar progress={Math.min(progressPercentage, 100)} color="blue" />
        <div className="mt-4 text-sm text-gray-400">
          {remainingWater > 0 
            ? `Faltam ${remainingWater}ml para atingir sua meta`
            : 'Meta diária atingida! 🎉'
          }
        </div>
      </Card>

      {/* Botões de adição rápida */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">{t('addWater')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              onClick={() => handleAddWater(amount)}
              variant="outline"
              className="flex flex-col items-center py-4"
              disabled={isLoading}
            >
              <Plus size={20} className="mb-1" />
              {amount === 1000 ? '1L' : `${amount}ml`}
            </Button>
          ))}
        </div>
      </Card>

      {/* Histórico diário */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Histórico Diário</h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((entry, index) => (
              <motion.div
                key={entry.criado_em}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-300">
                    {/* CORREÇÃO: Converte o timestamp direto para SP (UTC-3) */}
                    {(() => {
                      const utcDate = new Date(entry.criado_em);
                      const spDate = new Date(utcDate.getTime() - (3 * 3600000)); // UTC-3
                      return spDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={16} className="text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">
                    {entry.consumido_ml}ml
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              Nenhum registro de água hoje.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};