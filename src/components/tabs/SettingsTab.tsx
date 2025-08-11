import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Palette, Shield, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';

export const SettingsTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const t = useTranslation(state.user?.preferences.language);
  
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    age: state.user?.age?.toString() || '',
    weight: state.user?.weight?.toString() || '',
    height: state.user?.height?.toString() || '',
    gender: state.user?.gender || 'male',
    level: state.user?.level || 'beginner',
    goal: state.user?.goal || '',
  });

  const [preferences, setPreferences] = useState({
    shareWorkouts: state.user?.preferences.shareWorkouts || false,
    shareDiets: state.user?.preferences.shareDiets || false,
    darkMode: state.user?.preferences.darkMode || true,
    language: state.user?.preferences.language || 'pt_BR',
  });

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        ...formData,
        age: parseInt(formData.age) || undefined,
        weight: parseInt(formData.weight) || undefined,
        height: parseInt(formData.height) || undefined,
        preferences,
      }
    });
  };

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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('age')}
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('weight')}
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('height')}
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gender')}
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('level')}
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
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
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              {t('language')}
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="pt_BR">Português (Brasil)</option>
              <option value="en_US">English (US)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('darkMode')}</h3>
                <p className="text-gray-400 text-sm">Usar tema escuro na interface</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  preferences.darkMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    preferences.darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('shareWorkouts')}</h3>
                <p className="text-gray-400 text-sm">Permitir que amigos vejam seus treinos</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, shareWorkouts: !prev.shareWorkouts }))}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  preferences.shareWorkouts ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    preferences.shareWorkouts ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{t('shareDiets')}</h3>
                <p className="text-gray-400 text-sm">Permitir que amigos vejam sua dieta</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, shareDiets: !prev.shareDiets }))}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  preferences.shareDiets ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    preferences.shareDiets ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
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