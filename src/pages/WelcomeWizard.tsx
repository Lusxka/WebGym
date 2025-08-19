import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Scale, Target, Calendar, Heart, Dumbbell, Star, Activity, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const WelcomeWizard = () => {
  const { dispatch } = useApp();
  const { session, user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorGenerating, setErrorGenerating] = useState<string | null>(null);

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
    workoutDays: [] as string[],
    equipmentAccess: '',
    hasInjuries: false,
    injuries: '',
    hasMedicalConditions: false,
    medicalConditions: '',
    takesMedications: false,
    medications: '',
  });

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, name: user.user_metadata.full_name }));
    }
  }, [user]);


  const [errors, setErrors] = useState<any>({});
  const totalSteps = 6;

  const calculateBMI = (weight: string, height: string) => {
    const weightNum = parseFloat(weight.replace(",", "."));
    const heightNum = parseFloat(height.replace(",", ".")) / 100;
    if (!weightNum || !heightNum || heightNum <= 0) return null;
    return weightNum / (heightNum * heightNum);
  };

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
        units: { weight: 'kg', height: 'cm' }
      },
      metadata: {
        profileVersion: '1.0',
        source: 'welcome-wizard',
        completedSteps: totalSteps
      }
    };

    return JSON.stringify(userProfile, null, 2);
  };

  const validateStep = (currentStep: number) => {
    const newErrors: any = {};
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
      default: break;
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

  const handleFinish = async () => {
    if (validateStep(step) && user) {
      setIsGenerating(true);
      setErrorGenerating(null);
      dispatch({ type: 'SET_GENERATING_PLAN', payload: true });

      const userProfileObject = JSON.parse(generateUserProfile());
      const functionUrl = import.meta.env.VITE_GEMINI_FUNCTION_URL;

      if (!functionUrl) {
        console.error("VITE_GEMINI_FUNCTION_URL não está definida no .env");
        alert("Erro de configuração. A URL da função não foi encontrada.");
        setIsGenerating(false);
        dispatch({ type: 'SET_GENERATING_PLAN', payload: false });
        return;
      }

      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userProfile: userProfileObject }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao conectar com a IA.');
        }

        const result = await response.json();

        if (result.workoutPlan) {
          const levelMapping: { [key: string]: string } = {
            beginner: 'iniciante',
            intermediate: 'intermediario',
            advanced: 'avancado'
          };
          
          const genderMapping: { [key: string]: string } = {
            male: 'masculino',
            female: 'feminino'
          };

          const userProfileForDb = {
            id: user.id,
            email: user.email,
            senha_hash: user.id, // *** CORREÇÃO AQUI: Adicionar um valor de preenchimento ***
            nome: formData.name,
            idade: parseInt(formData.age),
            peso: parseFloat(formData.weight.replace(',', '.')),
            altura: parseFloat(formData.height.replace(',', '.')),
            sexo: genderMapping[formData.gender] || formData.gender,
            objetivo: formData.goal,
            nivel: levelMapping[formData.level] || formData.level,
          };

          const { error: upsertError } = await supabase
            .from('usuarios')
            .upsert(userProfileForDb);

          if (upsertError) {
            console.error("Erro ao guardar o perfil do utilizador:", upsertError);
            throw upsertError;
          } else {
            dispatch({ type: 'UPDATE_USER_PROFILE', payload: userProfileForDb });
          }

          dispatch({ type: 'SET_WORKOUT_PLAN', payload: result.workoutPlan });
          dispatch({ type: 'SHOW_WIZARD', payload: false });
        } else {
          throw new Error("A resposta da IA não continha um plano de treino válido.");
        }
        
      } catch (error: any) {
        console.error("Falha ao gerar plano:", error);
        setErrorGenerating(`Desculpe, não foi possível gerar seu plano: ${error.message}`);
        alert(`Ocorreu um erro ao gerar seu plano. Por favor, tente novamente.\nDetalhes: ${error.message}`);
      } finally {
        setIsGenerating(false);
        dispatch({ type: 'SET_GENERATING_PLAN', payload: false });
      }
    }
  };

  const toggleWorkoutDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day)
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day]
    }));
  };

  const formatNumber = (value: string) => value.replace(/[^\d,]/g, "").replace(/(\d+)(,?)(\d{0,2}).*/, "$1$2$3");

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
                        checked={formData[item.key as keyof typeof formData]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [item.key]: e.target.checked,
                          [item.field]: e.target.checked ? prev[item.field as keyof typeof formData] : ''
                        }))}
                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{item.label}</span>
                  </label>

                  {formData[item.key as keyof typeof formData] && (
                    <textarea
                      value={formData[item.field as keyof typeof formData] as string}
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>
        </div>
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-4xl">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
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
              <div className="p-8">
                <div className="min-h-[500px]">
                  {renderStep()}
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-800/30 border-t border-gray-700/50 flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${step === 1 ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 shadow-lg'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Anterior</span>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'bg-blue-500 scale-125' : i + 1 < step ? 'bg-green-500' : 'bg-gray-600'}`} />
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
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gerando Plano...</span>
                      </>
                    ) : (
                      <>
                        <span>Finalizar</span>
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeWizard;
