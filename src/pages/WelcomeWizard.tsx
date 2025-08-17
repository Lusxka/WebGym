import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Scale, Target, Calendar, Heart, Download, Copy, Dumbbell, Star, Activity, Zap } from 'lucide-react';

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
        language: 'pt_BR',
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
    if (bmi < 18.5) bmiInfo = { label: "Abaixo do peso", color: "from-yellow-400 to-yellow-600", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400", borderColor: "border-yellow-400/30" };
    else if (bmi < 25) bmiInfo = { label: "Peso ideal", color: "from-green-400 to-green-600", bgColor: "bg-green-500/20", textColor: "text-green-400", borderColor: "border-green-400/30" };
    else if (bmi < 30) bmiInfo = { label: "Sobrepeso", color: "from-orange-400 to-orange-600", bgColor: "bg-orange-500/20", textColor: "text-orange-400", borderColor: "border-orange-400/30" };
    else bmiInfo = { label: "Obesidade", color: "from-red-400 to-red-600", bgColor: "bg-red-500/20", textColor: "text-red-400", borderColor: "border-red-400/30" };
  }

  const stepConfig = [
    { icon: User, title: "Informações Pessoais", color: "from-blue-400 to-blue-600" },
    { icon: Scale, title: "Dados Físicos", color: "from-green-400 to-green-600" },
    { icon: Target, title: "Nível e Objetivos", color: "from-purple-400 to-purple-600" },
    { icon: Heart, title: "Saúde e Histórico", color: "from-red-400 to-red-600" },
    { icon: Calendar, title: "Disponibilidade", color: "from-orange-400 to-orange-600" },
    { icon: Check, title: "Confirmação", color: "from-emerald-400 to-emerald-600" }
  ];

  const renderStep = () => {
    const StepIcon = stepConfig[step - 1].icon;
    const gradientColor = stepConfig[step - 1].color;

    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Informações Pessoais</h3>
              <p className="text-gray-400">Vamos começar conhecendo você melhor</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${errors.name ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500 hover:border-gray-600'
                    }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.name && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  {errors.name}
                </p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Sexo <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${errors.gender ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500 hover:border-gray-600'
                      }`}
                  >
                    <option value="" disabled>Selecione seu sexo</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                  {errors.gender && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {errors.gender}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Idade <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${errors.age ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-blue-500 hover:border-gray-600'
                      }`}
                    placeholder="Sua idade"
                    min="10"
                    max="100"
                  />
                  {errors.age && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {errors.age}
                  </p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Dados Físicos</h3>
              <p className="text-gray-400">Seus dados antropométricos são essenciais</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Peso (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: formatNumber(e.target.value) }))}
                    className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/30 ${errors.weight ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-500 hover:border-gray-600'
                      }`}
                    placeholder="Ex: 70,5"
                  />
                  {errors.weight && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {errors.weight}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Altura (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: formatNumber(e.target.value) }))}
                    className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/30 ${errors.height ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-500 hover:border-gray-600'
                      }`}
                    placeholder="Ex: 175"
                  />
                  {errors.height && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {errors.height}
                  </p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Gordura corporal (%)
                  </label>
                  <input
                    type="text"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: formatNumber(e.target.value) }))}
                    className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 border-gray-700 focus:border-green-500 hover:border-gray-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/30"
                    placeholder="Opcional - se souber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Massa muscular (kg)
                  </label>
                  <input
                    type="text"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData(prev => ({ ...prev, muscleMass: formatNumber(e.target.value) }))}
                    className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 border-gray-700 focus:border-green-500 hover:border-gray-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/30"
                    placeholder="Opcional - se souber"
                  />
                </div>
              </div>

              {bmiInfo && (
                <div className={`p-6 ${bmiInfo.bgColor} border-2 ${bmiInfo.borderColor} rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Activity className={`w-5 h-5 ${bmiInfo.textColor}`} />
                      <span className="text-gray-300 font-medium">Seu IMC: <span className={`font-bold ${bmiInfo.textColor}`}>{bmi.toFixed(1)}</span></span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${bmiInfo.color} text-white shadow-lg`}>
                      {bmiInfo.label}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${bmiInfo.color} rounded-full transition-all duration-1000 shadow-lg`}
                      style={{ width: `${Math.min(bmi, 35) * 3}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Nível e Objetivos</h3>
              <p className="text-gray-400">Defina sua experiência e metas fitness</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-4">Seu nível de experiência</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'beginner', label: 'Iniciante', desc: '0-1 ano', icon: Star },
                    { value: 'intermediate', label: 'Intermediário', desc: '1-3 anos', icon: Activity },
                    { value: 'advanced', label: 'Avançado', desc: '3+ anos', icon: Zap }
                  ].map(level => {
                    const LevelIcon = level.icon;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level: level.value }))}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 group ${formData.level === level.value
                            ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                          }`}
                      >
                        <LevelIcon className={`w-8 h-8 mx-auto mb-3 ${formData.level === level.value ? 'text-purple-400' : 'text-gray-400 group-hover:text-gray-300'
                          }`} />
                        <h4 className={`font-bold text-lg ${formData.level === level.value ? 'text-purple-400' : 'text-white'
                          }`}>{level.label}</h4>
                        <p className="text-gray-400 text-sm mt-1">{level.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-4">
                  Sua meta principal <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Hipertrofia', 'Emagrecimento', 'Resistência', 'Força', 'Definição', 'Combinação'].map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, goal }))}
                      className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-300 hover:scale-105 ${formData.goal === goal
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/25'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300 bg-gray-800/50'
                        }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                {errors.goal && <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  {errors.goal}
                </p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Saúde e Histórico</h3>
              <p className="text-gray-400">Informações importantes para sua segurança</p>
            </div>

            <div className="space-y-6">
              {[
                { key: 'hasInjuries', label: 'Possui histórico de lesões?', field: 'injuries', icon: '🩹' },
                { key: 'hasMedicalConditions', label: 'Possui condições médicas?', field: 'medicalConditions', icon: '⚕️' },
                { key: 'takesMedications', label: 'Usa medicamentos regulares?', field: 'medications', icon: '💊' }
              ].map(item => (
                <div key={item.key} className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700 hover:border-gray-600 transition-all duration-300">
                  <label className="flex items-center space-x-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData[item.key]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [item.key]: e.target.checked,
                          [item.field]: e.target.checked ? prev[item.field] : ''
                        }))}
                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{item.label}</span>
                  </label>

                  {formData[item.key] && (
                    <textarea
                      value={formData[item.field]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [item.field]: e.target.value }))}
                      className="w-full mt-4 px-4 py-3 bg-gray-900/50 text-white rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 resize-none transition-all duration-300"
                      rows={3}
                      placeholder="Descreva detalhadamente..."
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Disponibilidade</h3>
              <p className="text-gray-400">Quando e onde você pode treinar?</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-4">
                  Dias disponíveis para treinar <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'monday', label: 'SEG', full: 'Segunda' },
                    { key: 'tuesday', label: 'TER', full: 'Terça' },
                    { key: 'wednesday', label: 'QUA', full: 'Quarta' },
                    { key: 'thursday', label: 'QUI', full: 'Quinta' },
                    { key: 'friday', label: 'SEX', full: 'Sexta' },
                    { key: 'saturday', label: 'SAB', full: 'Sábado' },
                    { key: 'sunday', label: 'DOM', full: 'Domingo' }
                  ].map(day => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWorkoutDay(day.key)}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 hover:scale-105 group ${formData.workoutDays.includes(day.key)
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/25'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300 bg-gray-800/50'
                        }`}
                    >
                      <div className="text-base">{day.label}</div>
                      <div className="text-xs opacity-60 mt-1">{day.full}</div>
                    </button>
                  ))}
                </div>
                {errors.workoutDays && <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  {errors.workoutDays}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Equipamentos disponíveis <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.equipmentAccess}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipmentAccess: e.target.value }))}
                  className={`w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/30 ${errors.equipmentAccess ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-orange-500 hover:border-gray-600'
                    }`}
                >
                  <option value="" disabled>Selecione o tipo de equipamento</option>
                  <option value="academia">Academia</option>
                  <option value="halteres">Halteres em casa</option>
                  <option value="calistenia">Calistenia</option>
                  <option value="crossfit">CrossFit</option>
                </select>
                {errors.equipmentAccess && <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  {errors.equipmentAccess}
                </p>}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Quase pronto!</h3>
              <p className="text-gray-400">Revise suas informações antes de finalizar</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700 p-6 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Nome:</span>
                  <span className="text-white font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Idade:</span>
                  <span className="text-white font-semibold">{formData.age} anos</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Sexo:</span>
                  <span className="text-white font-semibold">{formData.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Meta:</span>
                  <span className="text-white font-semibold">{formData.goal}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Peso:</span>
                  <span className="text-white font-semibold">{formData.weight} kg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Altura:</span>
                  <span className="text-white font-semibold">{formData.height} cm</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Nível:</span>
                  <span className="text-white font-semibold">
                    {formData.level === 'beginner' ? 'Iniciante' : formData.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 font-medium">Treinos/semana:</span>
                  <span className="text-white font-semibold">{formData.workoutDays.length} dias</span>
                </div>
                {bmi && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50 md:col-span-2">
                    <span className="text-gray-400 font-medium">IMC:</span>
                    <span className={`font-bold ${bmiInfo?.textColor}`}>{bmi.toFixed(1)} - {bmiInfo?.label}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-emerald-400 font-bold text-lg">Tudo pronto para começar!</h4>
              </div>
              <p className="text-emerald-300 text-sm leading-relaxed">
                Seu perfil personalizado será criado e você receberá um plano de treino e dieta adequado aos seus objetivos.
                Vamos juntos nessa jornada fitness! 💪
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
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-y-auto">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-4xl">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">


              {/* Progress Bar */}
              <div className="px-8 py-6 bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">Passo {step} de {totalSteps}</span>
                    <div className="h-4 w-px bg-gray-600"></div>
                    <span className="text-sm text-gray-400">{stepConfig[step - 1].title}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="min-h-[500px]">
                  {renderStep()}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-8 py-6 bg-gray-800/30 border-t border-gray-700/50 flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${step === 1
                      ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 shadow-lg'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i + 1 === step
                          ? 'bg-blue-500 scale-125'
                          : i + 1 < step
                            ? 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                    />
                  ))}
                </div>

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <span>Finalizar</span>
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal JSON - Redesenhado */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">

            {/* Header do Modal */}
            <header className="p-8 border-b border-gray-700 bg-gradient-to-r from-green-600/20 to-blue-600/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Perfil Criado com Sucesso!</h2>
                    <p className="text-gray-400 text-sm mt-1">Dados estruturados do seu perfil fitness</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="text-gray-400 hover:text-white text-4xl leading-none transition-colors hover:rotate-90 duration-300"
                >
                  &times;
                </button>
              </div>
            </header>

            <div className="p-8 flex-1 overflow-hidden flex flex-col">

              {/* Botões de ação */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:scale-105"
                >
                  <Copy size={20} />
                  Copiar JSON
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:scale-105"
                >
                  <Download size={20} />
                  Baixar Arquivo
                </button>
              </div>

              {/* JSON Preview */}
              <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {generatedJson}
                </pre>
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-green-400 font-bold text-lg">Perfil Estruturado e Pronto!</h4>
                </div>
                <p className="text-green-300 text-sm leading-relaxed">
                  Seu perfil foi criado com sucesso e contém todas as informações organizadas em seções:
                  dados pessoais, físicos, fitness, saúde e configurações. Agora você pode começar sua jornada personalizada no WebGym! 🚀
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