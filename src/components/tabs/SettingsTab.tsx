import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Palette, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';

// Tipagem para o objeto de preferências, após o parse do JSON
interface UserPreferences {
  shareWorkouts: boolean;
  shareDiets: boolean;
  darkMode: boolean;
  language: 'pt_BR' | 'en_US';
}

export const SettingsTab: React.FC = () => {
  const { state, dispatch } = useApp();

  // Parse seguro das preferências que vêm como string JSON
  const parsedPreferences = useMemo((): UserPreferences => {
    try {
      if (state.user?.preferences && typeof state.user.preferences === 'string') {
        return JSON.parse(state.user.preferences);
      }
    } catch (error) {
      console.error("Falha ao fazer parse das preferências:", error);
    }
    // Retorna um objeto padrão seguro se algo der errado
    return {
      shareWorkouts: false,
      shareDiets: false,
      darkMode: true,
      language: 'pt_BR',
    };
  }, [state.user?.preferences]);

  const t = useTranslation(parsedPreferences.language);
  
  // Estado do formulário inicializado com dados do usuário
  const [formData, setFormData] = useState({
    nome: state.user?.nome || '',
    idade: state.user?.idade?.toString() || '',
    peso: state.user?.peso?.toString() || '',
    altura: state.user?.altura?.toString() || '',
    sexo: state.user?.sexo || 'male',
    nivel: state.user?.nivel || 'beginner',
    objetivos: state.user?.objetivos || '',
  });

  // Estado das preferências inicializado com os dados já "traduzidos"
  const [preferences, setPreferences] = useState<UserPreferences>(parsedPreferences);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_USER_PROFILE',
      payload: {
        ...formData,
        idade: formData.idade ? parseInt(formData.idade) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        altura: formData.altura ? parseInt(formData.altura) : null,
        preferencias: JSON.stringify(preferences),
      }
    });
    // Aqui você pode adicionar um feedback para o usuário, como um toast
  };

  // Componente para o toggle switch com animação corrigida
  const ToggleSwitch = ({ enabled, onClick }: { enabled: boolean, onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
        enabled ? 'bg-blue-600 justify-end' : 'bg-gray-600 justify-start'
      }`}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full mx-1 shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('settings')}</h1>
        <p className="text-gray-400">Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-white">{t('personalData')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs de texto e número */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('name')}</label>
            <input type="text" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('age')}</label>
            <input type="number" value={formData.idade} onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('weight')} (kg)</label>
            <input type="number" step="0.1" value={formData.peso} onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('height')} (cm)</label>
            <input type="number" value={formData.altura} onChange={(e) => setFormData(prev => ({ ...prev, altura: e.target.value }))} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          
          {/* Menus de Seleção (como no modelo original) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('gender')}</label>
            <select
              value={formData.sexo}
              onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value as 'male' | 'female' }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('level')}</label>
            <select
              value={formData.nivel}
              onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value as any }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="beginner">{t('beginner')}</option>
              <option value="intermediate">{t('intermediate')}</option>
              <option value="advanced">{t('advanced')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold text-white">{t('preferences')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2"><Globe className="inline w-4 h-4 mr-2" />{t('language')}</label>
            <select value={preferences.language} onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="pt_BR">Português (Brasil)</option>
              <option value="en_US">English (US)</option>
            </select>
          </div>
          <div className="space-y-4">
            {/* Toggles com animação corrigida */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('darkMode')}</h3>
                <p className="text-gray-400 text-sm">Usar tema escuro na interface</p>
              </div>
              <ToggleSwitch enabled={preferences.darkMode} onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('shareWorkouts')}</h3>
                <p className="text-gray-400 text-sm">Permitir que amigos vejam seus treinos</p>
              </div>
              <ToggleSwitch enabled={preferences.shareWorkouts} onClick={() => setPreferences(prev => ({ ...prev, shareWorkouts: !prev.shareWorkouts }))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('shareDiets')}</h3>
                <p className="text-gray-400 text-sm">Permitir que amigos vejam sua dieta</p>
              </div>
              <ToggleSwitch enabled={preferences.shareDiets} onClick={() => setPreferences(prev => ({ ...prev, shareDiets: !prev.shareDiets }))} />
            </div>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} icon={Save} size="lg">
          {t('save')}
        </Button>
      </div>
    </div>
  );
};
