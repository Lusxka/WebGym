import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Scale, Target, Calendar, Heart, Download, Copy } from 'lucide-react';

const WelcomeWizard = () => {
  const [step, setStep] = useState(1);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [generatedJson, setGeneratedJson] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    level: 'beginner',
    goal: '',
    workoutDays: [],
    equipmentAccess: '',
    hasInjuries: false,
    injuries: '',
    hasMedicalConditions: false,
    medicalConditions: '',
    takesMedications: false,
    medications: '',
  });

  const [errors, setErrors] = useState({});
  const totalSteps = 6;

  // Função para calcular IMC
  const calculateBMI = (weight, height) => {
    const weightNum = parseFloat(weight.replace(",", "."));
    const heightNum = parseFloat(height.replace(",", ".")) / 100;
    if (!weightNum || !heightNum || heightNum <= 0) return null;
    return weightNum / (heightNum * heightNum);
  };

  // Função para gerar JSON estruturado
  const generateUserProfile = () => {
    const bmi = calculateBMI(formData.weight, formData.height);
    let bmiCategory = null;
    if (bmi) {
      if (bmi < 18.5) bmiCategory = "underweight";
      else if (bmi < 25) bmiCategory = "normal";
      else if (bmi < 30) bmiCategory = "overweight";
      else bmiCategory = "obese";
    }

    const userProfile = {
      timestamp: new Date().toISOString(),
      personalInfo: {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        createdAt: new Date().toISOString().split('T')[0]
      },
      physicalData: {
        weight: parseFloat(formData.weight.replace(",", ".")),
        height: parseFloat(formData.height.replace(",", ".")),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat.replace(",", ".")) : null,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass.replace(",", ".")) : null,
        bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
        bmiCategory: bmiCategory
      },
      fitnessProfile: {
        experienceLevel: formData.level,
        primaryGoal: formData.goal,
        workoutDaysPerWeek: formData.workoutDays.length,
        preferredWorkoutDays: formData.workoutDays,
        equipmentAccess: formData.equipmentAccess.trim()
      },
      healthInfo: {
        hasInjuries: formData.hasInjuries,
        injuries: formData.hasInjuries ? formData.injuries.trim() : null,
        hasMedicalConditions: formData.hasMedicalConditions,
        medicalConditions: formData.hasMedicalConditions ? formData.medicalConditions.trim() : null,
        takesMedications: formData.takesMedications,
        medications: formData.takesMedications ? formData.medications.trim() : null
      },
      settings: {
        language: 'pt-BR',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        units: {
          weight: 'kg',
          height: 'cm',
          temperature: 'celsius'
        }
      },
      metadata: {
        profileVersion: '1.0',
        source: 'welcome-wizard',
        completedSteps: totalSteps
      }
    };

    return JSON.stringify(userProfile, null, 2);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.age) newErrors.age = 'Idade é obrigatória';
        if (!formData.gender) newErrors.gender = 'Sexo é obrigatório';
        break;
      case 2:
        if (!formData.weight) newErrors.weight = 'Peso é obrigatório';
        if (!formData.height) newErrors.height = 'Altura é obrigatória';
        break;
      case 3:
        if (!formData.goal) newErrors.goal = 'Meta é obrigatória';
        break;
      case 5:
        if (formData.workoutDays.length === 0) newErrors.workoutDays = 'Selecione pelo menos um dia';
        if (!formData.equipmentAccess.trim()) newErrors.equipmentAccess = 'Campo obrigatório';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(prevStep => prevStep - 1);
    }
  };

  const handleFinish = () => {
    if (validateStep(step)) {
      const jsonProfile = generateUserProfile();
      setGeneratedJson(jsonProfile);
      setShowJsonModal(true);
      
      // Log no console para desenvolvimento
      console.log('📋 Perfil do Usuário Gerado:', JSON.parse(jsonProfile));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson).then(() => {
      alert('JSON copiado para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-profile-${formData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleWorkoutDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day]
    }));
  };

  const formatNumber = (value) => value.replace(/[^\d,]/g, "").replace(/(\d+)(,?)(\d{0,2}).*/, "$1$2$3");

  const bmi = calculateBMI(formData.weight, formData.height);
  let bmiInfo = null;
  if (bmi) {
    if (bmi < 18.5) bmiInfo = { label: "Abaixo do peso", color: "bg-yellow-500" };
    else if (bmi < 25) bmiInfo = { label: "Peso ideal", color: "bg-green-500" };
    else if (bmi < 30) bmiInfo = { label: "Sobrepeso", color: "bg-orange-500" };
    else bmiInfo = { label: "Obesidade", color: "bg-red-500" };
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Informações Pessoais</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.name ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sexo <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.gender ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                  >
                    <option value="" disabled>Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                  {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idade <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.age ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="Sua idade"
                  />
                  {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Scale className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Dados Físicos</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Peso (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: formatNumber(e.target.value) }))}
                    className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.weight ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="Ex: 70,5"
                  />
                  {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Altura (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: formatNumber(e.target.value) }))}
                    className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.height ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="Ex: 175"
                  />
                  {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gordura corporal (%)
                  </label>
                  <input
                    type="text"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: formatNumber(e.target.value) }))}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Opcional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Massa muscular (kg)
                  </label>
                  <input
                    type="text"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData(prev => ({ ...prev, muscleMass: formatNumber(e.target.value) }))}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {bmiInfo && (
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300">IMC: <span className="text-white font-bold">{bmi.toFixed(1)}</span></span>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${bmiInfo.color}`}>
                      {bmiInfo.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full">
                    <div className={`h-full ${bmiInfo.color} rounded-full transition-all duration-500`} 
                         style={{ width: `${Math.min(bmi, 35) * 3}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Nível e Objetivos</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experiência</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="beginner">Iniciante (0-1 ano)</option>
                  <option value="intermediate">Intermediário (1-3 anos)</option>
                  <option value="advanced">Avançado (3+ anos)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Meta principal <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Hipertrofia', 'Emagrecimento', 'Resistência', 'Força', 'Definição', 'Combinação'].map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, goal }))}
                      className={`p-3 rounded-lg border-2 text-sm transition-all hover:scale-105 ${
                        formData.goal === goal
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                {errors.goal && <p className="text-red-400 text-sm mt-2">{errors.goal}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Saúde e Histórico</h3>
            </div>

            <div className="space-y-4">
              {[
                { key: 'hasInjuries', label: 'Histórico de lesões?', field: 'injuries' },
                { key: 'hasMedicalConditions', label: 'Condições médicas?', field: 'medicalConditions' },
                { key: 'takesMedications', label: 'Uso de medicamentos?', field: 'medications' }
              ].map(item => (
                <div key={item.key} className="p-4 bg-gray-700/30 rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[item.key]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [item.key]: e.target.checked,
                        [item.field]: e.target.checked ? prev[item.field] : ''
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-200">{item.label}</span>
                  </label>
                  
                  {formData[item.key] && (
                    <textarea
                      value={formData[item.field]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [item.field]: e.target.value }))}
                      className="w-full mt-3 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      rows={2}
                      placeholder="Descreva..."
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Disponibilidade</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Dias para treinar <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'monday', label: 'SEG' },
                    { key: 'tuesday', label: 'TER' },
                    { key: 'wednesday', label: 'QUA' },
                    { key: 'thursday', label: 'QUI' },
                    { key: 'friday', label: 'SEX' },
                    { key: 'saturday', label: 'SAB' },
                    { key: 'sunday', label: 'DOM' }
                  ].map(day => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWorkoutDay(day.key)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.workoutDays.includes(day.key)
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors.workoutDays && <p className="text-red-400 text-sm mt-2">{errors.workoutDays}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipamentos disponíveis <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.equipmentAccess}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipmentAccess: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.equipmentAccess ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  placeholder="Ex: academia, casa com halteres, peso corporal..."
                />
                {errors.equipmentAccess && <p className="text-red-400 text-sm mt-1">{errors.equipmentAccess}</p>}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Confirmação</h3>
              <p className="text-gray-400 text-sm mt-2">Revise suas informações antes de finalizar</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Nome:</span> <span className="text-white">{formData.name}</span></div>
                <div><span className="text-gray-400">Idade:</span> <span className="text-white">{formData.age} anos</span></div>
                <div><span className="text-gray-400">Sexo:</span> <span className="text-white">{formData.gender === 'male' ? 'Masculino' : 'Feminino'}</span></div>
                <div><span className="text-gray-400">Meta:</span> <span className="text-white">{formData.goal}</span></div>
                <div><span className="text-gray-400">Peso:</span> <span className="text-white">{formData.weight} kg</span></div>
                <div><span className="text-gray-400">Altura:</span> <span className="text-white">{formData.height} cm</span></div>
                <div><span className="text-gray-400">Nível:</span> <span className="text-white">{formData.level === 'beginner' ? 'Iniciante' : formData.level === 'intermediate' ? 'Intermediário' : 'Avançado'}</span></div>
                <div><span className="text-gray-400">Treinos/semana:</span> <span className="text-white">{formData.workoutDays.length} dias</span></div>
                {bmi && <div className="col-span-2"><span className="text-gray-400">IMC:</span> <span className="text-white">{bmi.toFixed(1)}</span></div>}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                ✨ Ao finalizar, será gerado um arquivo JSON com seu perfil completo que pode ser usado para integração com outros sistemas.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <div className="bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-700 p-6 backdrop-blur-sm">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
                <p className="text-gray-400">Configure seu perfil de treino</p>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Passo {step} de {totalSteps}</span>
                  <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6 min-h-[350px]">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    step === 1
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                  >
                    <span>Finalizar</span>
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal JSON */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <header className="p-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Perfil JSON Gerado</h2>
                <p className="text-gray-400 text-sm mt-1">Dados estruturados do seu perfil fitness</p>
              </div>
              <button 
                onClick={() => setShowJsonModal(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                &times;
              </button>
            </header>
            
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              {/* Botões de ação */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Copy size={16} />
                  Copiar JSON
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Download size={16} />
                  Baixar Arquivo
                </button>
              </div>

              {/* JSON Preview */}
              <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 border border-gray-600">
                <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {generatedJson}
                </pre>
              </div>

              {/* Informações adicionais */}
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-green-400 font-medium mb-2">✅ Perfil Criado com Sucesso!</h4>
                <p className="text-green-300 text-sm">
                  Seu perfil foi estruturado e está pronto para ser usado. O JSON contém todas as informações organizadas em seções como dados pessoais, físicos, fitness, saúde e configurações.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomeWizard;