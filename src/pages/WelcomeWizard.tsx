import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTranslation } from '../data/translations';

export const WelcomeWizard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male' as 'male' | 'female',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goal: '',
    workoutDays: [] as string[],
  });

  const t = useTranslation(state.user?.preferences.language);
  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    dispatch({
      type: 'COMPLETE_WIZARD',
      payload: {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight.replace(',', '.')),
        height: parseFloat(formData.height.replace(',', '.')),
      }
    });
  };

  const toggleWorkoutDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day]
    }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const calcularIMC = (peso: string, altura: string) => {
    const pesoNum = parseFloat(peso.replace(",", "."));
    const alturaNum = parseFloat(altura.replace(",", ".")) / 100;
    if (!pesoNum || !alturaNum) return null;
    return pesoNum / (alturaNum * alturaNum);
  };

  const formatarNumero = (valor: string) => {
    return valor
      .replace(/[^\d,]/g, "")
      .replace(/(\d+)(,?)(\d{0,2}).*/, "$1$2$3");
  };

  const imc = calcularIMC(formData.weight, formData.height);
  let imcLabel = "";
  let imcColor = "bg-red-500";

  if (imc) {
    if (imc < 18.5) {
      imcLabel = "Abaixo do peso";
      imcColor = "bg-yellow-500";
    } else if (imc < 25) {
      imcLabel = "Peso ideal";
      imcColor = "bg-green-500";
    } else if (imc < 30) {
      imcLabel = "Sobrepeso";
      imcColor = "bg-orange-500";
    } else {
      imcLabel = "Obesidade";
      imcColor = "bg-red-600";
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Digite seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('age')}</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Sua idade"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('weight')}</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: formatarNumero(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Peso em kg (ex: 70,5)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('height')}</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: formatarNumero(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Altura em cm (ex: 175,5)"
              />
            </div>
            {imc && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <p className="text-gray-300 text-sm mb-2">
                  Seu IMC: <span className="font-bold">{imc.toFixed(1)}</span> - {imcLabel}
                </p>
                <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${imcColor}`}
                    style={{ width: `${Math.min(imc, 40) * 2.5}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(imc, 40) * 2.5}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">{t('gender')}</label>
            <div className="grid grid-cols-2 gap-4">
              {['male', 'female'].map((gender) => (
                <motion.button
                  key={gender}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, gender: gender as 'male' | 'female' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.gender === gender
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {t(gender)}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">{t('level')}</label>
            <div className="space-y-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setFormData(prev => ({ ...prev, level: level as any }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.level === level
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {t(level)}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">{t('workoutDays')}</label>
            <div className="grid grid-cols-2 gap-3">
              {days.map((day) => (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleWorkoutDay(day)}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    formData.workoutDays.includes(day)
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {t(day)}
                </motion.button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="p-8 shadow-xl shadow-black/30">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t('welcomeWizard')}</h2>
            <p className="text-gray-400">{t('wizardIntro')}</p>
          </div>
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Passo {step} de {totalSteps}</span>
              <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="mb-8">{renderStep()}</div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handlePrevious} disabled={step === 1} icon={ChevronLeft}>
              {t('previous')}
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} icon={ChevronRight}>
                {t('next')}
              </Button>
            ) : (
              <Button onClick={handleFinish} icon={Check}>
                {t('finish')}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
