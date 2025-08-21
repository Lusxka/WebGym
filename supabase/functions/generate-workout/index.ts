// ===============================
// EDGE FUNCTION CORRIGIDA
// ===============================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.sh/@google/generative-ai'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Configuração do Supabase dentro da Edge Function
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapear os dias da semana para português
const dayMapping: { [key: string]: string } = {
  'monday': 'segunda',
  'tuesday': 'terca',
  'wednesday': 'quarta',
  'thursday': 'quinta',
  'friday': 'sexta',
  'saturday': 'sabado',
  'sunday': 'domingo'
}

// Função para obter data/hora de São Paulo
const getSaoPauloDate = (): Date => {
  const now = new Date()
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const saoPauloTime = new Date(utcTime + (-3 * 3600000))
  return saoPauloTime
}

const getSaoPauloISOString = (): string => {
  return getSaoPauloDate().toISOString()
}

// Função para limpar dados antigos do usuário
const clearUserPlans = async (userId: string) => {
  try {
    console.log(`🗑️ Limpando planos antigos do usuário ${userId}...`)
    
    // Buscar IDs dos planos de treino para deletar exercícios relacionados
    const { data: workoutPlans } = await supabase
      .from('planos_treino')
      .select('id')
      .eq('usuario_id', userId)

    if (workoutPlans && workoutPlans.length > 0) {
      const planIds = workoutPlans.map(plan => plan.id)
      
      // Deletar exercícios dos planos de treino
      const { error: deleteExercisesError } = await supabase
        .from('exercicios_treino')
        .delete()
        .in('plano_id', planIds)
      
      if (deleteExercisesError) {
        console.error('Erro ao deletar exercícios:', deleteExercisesError)
      } else {
        console.log(`✅ ${planIds.length} exercícios deletados`)
      }
    }

    // Buscar IDs dos planos de dieta para deletar refeições relacionadas
    const { data: dietPlans } = await supabase
      .from('planos_dieta')
      .select('id')
      .eq('usuario_id', userId)

    if (dietPlans && dietPlans.length > 0) {
      const dietPlanIds = dietPlans.map(plan => plan.id)
      
      // CORREÇÃO: Usar o campo correto plano_dieta_id
      const { error: deleteMealsError } = await supabase
        .from('refeicoes_dieta')
        .delete()
        .in('plano_dieta_id', dietPlanIds)
      
      if (deleteMealsError) {
        console.error('Erro ao deletar refeições:', deleteMealsError)
      } else {
        console.log(`✅ Refeições de ${dietPlanIds.length} planos deletadas`)
      }
    }

    // Deletar planos de treino
    const { error: deleteWorkoutPlansError } = await supabase
      .from('planos_treino')
      .delete()
      .eq('usuario_id', userId)
    
    if (deleteWorkoutPlansError) {
      console.error('Erro ao deletar planos de treino:', deleteWorkoutPlansError)
    }

    // Deletar planos de dieta
    const { error: deleteDietPlansError } = await supabase
      .from('planos_dieta')
      .delete()
      .eq('usuario_id', userId)
    
    if (deleteDietPlansError) {
      console.error('Erro ao deletar planos de dieta:', deleteDietPlansError)
    }

    console.log(`✅ Planos antigos do usuário ${userId} removidos com sucesso`)
  } catch (error) {
    console.error('❌ Erro ao limpar planos antigos:', error)
    throw error
  }
}

// Função para inserir planos de treino no BD
const insertWorkoutPlans = async (userId: string, workoutPlan: any[]) => {
  const createdAt = getSaoPauloISOString()
  console.log('💪 Inserindo planos de treino...')
  
  for (const dayPlan of workoutPlan) {
    try {
      const diaSemana = dayMapping[dayPlan.day.toLowerCase()] || dayPlan.day.toLowerCase()
      
      console.log(`📋 Inserindo plano para ${diaSemana}:`, dayPlan.name)
      
      // Inserir plano de treino
      const { data: planoTreino, error: planoError } = await supabase
        .from('planos_treino')
        .insert({
          usuario_id: userId,
          dia_semana: diaSemana,
          nome: dayPlan.name || 'Treino do Dia',
          objetivo: dayPlan.name.includes('Descanso') ? 'descanso' : 'treino',
          criado_em: createdAt
        })
        .select('id')
        .single()

      if (planoError) {
        console.error(`❌ Erro ao inserir plano de treino para ${diaSemana}:`, planoError)
        throw planoError
      }

      console.log(`✅ Plano inserido para ${diaSemana}, ID: ${planoTreino.id}`)

      // Inserir exercícios se existirem
      if (dayPlan.exercises && dayPlan.exercises.length > 0) {
        console.log(`💪 Inserindo ${dayPlan.exercises.length} exercícios...`)
        
        // CORREÇÃO: Removido o campo usuario_id da inserção dos exercícios
        const exercisesToInsert = dayPlan.exercises.map((exercise: any, index: number) => ({
          plano_id: planoTreino.id,
          nome: exercise.name,
          series: exercise.sets || '3',
          repeticoes: exercise.reps || '10',
          descanso: exercise.rest || '60s',
          observacao: exercise.observation || null,
          video_url: exercise.videoUrl || null,
          ordem: index + 1,
          concluido: false
        }))

        const { error: exerciseError } = await supabase
          .from('exercicios_treino')
          .insert(exercisesToInsert)

        if (exerciseError) {
          console.error(`❌ Erro ao inserir exercícios para ${diaSemana}:`, exerciseError)
          throw exerciseError
        }
        
        console.log(`✅ ${exercisesToInsert.length} exercícios inseridos para ${diaSemana}`)
      }

    } catch (error) {
      console.error(`❌ Erro ao processar dia ${dayPlan.day}:`, error)
      throw error
    }
  }
  
  console.log('✅ Todos os planos de treino inseridos com sucesso!')
}

// Função para inserir planos de dieta no BD
const insertDietPlans = async (userId: string, nutritionPlan: any) => {
  const createdAt = getSaoPauloISOString()
  console.log('🥗 Inserindo planos de dieta...')
  
  // Criar planos de dieta para todos os dias da semana
  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  
  for (const dia of diasSemana) {
    try {
      console.log(`🍽️ Inserindo plano de dieta para ${dia}`)
      
      // Inserir plano de dieta
      const { data: planoDieta, error: planoError } = await supabase
        .from('planos_dieta')
        .insert({
          usuario_id: userId,
          dia_semana: dia,
          objetivo: 'nutricao_balanceada',
          descricao: nutritionPlan.summary || 'Plano nutricional personalizado',
          criado_em: createdAt
        })
        .select('id')
        .single()

      if (planoError) {
        console.error(`❌ Erro ao inserir plano de dieta para ${dia}:`, planoError)
        throw planoError
      }

      console.log(`✅ Plano de dieta inserido para ${dia}, ID: ${planoDieta.id}`)

      // Inserir refeições
      if (nutritionPlan.meals && nutritionPlan.meals.length > 0) {
        console.log(`🍽️ Inserindo ${nutritionPlan.meals.length} refeições...`)
        
        const refeicoesToInsert = nutritionPlan.meals.map((meal: any, index: number) => {
          // Calcular calorias estimadas baseado no tipo de refeição
          const estimateCalories = (mealName: string): number => {
            const name = mealName.toLowerCase()
            if (name.includes('café') || name.includes('lanche')) return 300
            if (name.includes('almoço') || name.includes('jantar')) return 600
            if (name.includes('ceia')) return 200
            return 400
          }

          return {
            plano_dieta_id: planoDieta.id, // CORREÇÃO: campo correto
            nome: meal.name,
            horario: meal.time || '08:00',
            descricao: Array.isArray(meal.options) ? meal.options.join(', ') : meal.options || 'Refeição balanceada',
            calorias: estimateCalories(meal.name),
            confirmada: false,
            ordem: index + 1,
            criado_em: createdAt
          }
        })

        const { error: refeicaoError } = await supabase
          .from('refeicoes_dieta')
          .insert(refeicoesToInsert)

        if (refeicaoError) {
          console.error(`❌ Erro ao inserir refeições para ${dia}:`, refeicaoError)
          throw refeicaoError
        }
        
        console.log(`✅ ${refeicoesToInsert.length} refeições inseridas para ${dia}`)
      }

    } catch (error) {
      console.error(`❌ Erro ao processar dieta para ${dia}:`, error)
      throw error
    }
  }
  
  console.log('✅ Todos os planos de dieta inseridos com sucesso!')
}

// Função para registrar log de geração
const logGeneration = async (userId: string, success: boolean, errorMsg?: string) => {
  try {
    // Verifica se a tabela logs_geracao existe, senão ignora silenciosamente
    await supabase
      .from('logs_geracao')
      .insert({
        usuario_id: userId,
        tipo: 'plano_completo',
        sucesso: success,
        erro: errorMsg || null,
        criado_em: getSaoPauloISOString()
      })
    console.log('📊 Log registrado com sucesso')
  } catch (error) {
    console.log('⚠️ Tabela de logs não encontrada, continuando sem registrar log')
  }
}

// FUNÇÃO BUILDPROMPT CORRIGIDA
const buildPrompt = (userProfile: any): string => {
  console.log('🤖 Construindo prompt para IA...')
  console.log('👤 Dados do usuário:', JSON.stringify(userProfile, null, 2))
  
  // CORREÇÃO: Buscar dias de forma mais abrangente
  let diasSelecionados = []
  
  // Tentar várias formas de extrair os dias selecionados
  if (userProfile.diasTreino && Array.isArray(userProfile.diasTreino)) {
    diasSelecionados = userProfile.diasTreino
  } else if (userProfile.selectedDays && Array.isArray(userProfile.selectedDays)) {
    diasSelecionados = userProfile.selectedDays
  } else if (userProfile.days && Array.isArray(userProfile.days)) {
    diasSelecionados = userProfile.days
  } else if (userProfile.workoutDays && Array.isArray(userProfile.workoutDays)) {
    diasSelecionados = userProfile.workoutDays
  } else {
    // Se não encontrar, procurar por campos booleanos
    const possibleDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
    diasSelecionados = possibleDays.filter(day => userProfile[day] === true)
    
    if (diasSelecionados.length === 0) {
      // Última tentativa: procurar por campos em inglês
      const englishDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      diasSelecionados = englishDays.filter(day => userProfile[day] === true)
    }
  }
  
  console.log('🔍 Dias encontrados no userProfile:', diasSelecionados)
  
  // Se ainda não encontrou nada, assumir alguns dias padrão baseado no objetivo
  if (diasSelecionados.length === 0) {
    console.warn('⚠️ Nenhum dia encontrado, usando padrão baseado no nível')
    const nivel = userProfile.nivel?.toLowerCase() || 'iniciante'
    
    if (nivel === 'iniciante') {
      diasSelecionados = ['monday', 'wednesday', 'friday'] // 3x por semana
    } else if (nivel === 'intermediario' || nivel === 'intermediário') {
      diasSelecionados = ['monday', 'tuesday', 'thursday', 'friday'] // 4x por semana
    } else {
      diasSelecionados = ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'] // 5x por semana
    }
  }
  
  // Mapear dias para inglês se necessário
  const dayMap: { [key: string]: string } = {
    'segunda': 'monday', 'terca': 'tuesday', 'quarta': 'wednesday', 
    'quinta': 'thursday', 'sexta': 'friday', 'sabado': 'saturday', 'domingo': 'sunday',
    'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
    'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
  }
  
  const diasSelecionadosEn = diasSelecionados.map(dia => 
    dayMap[dia.toLowerCase()] || dia.toLowerCase()
  ).filter(Boolean)
  
  const diasSelecionadosStr = diasSelecionadosEn.join(', ')
  
  console.log(`📅 Dias finais selecionados: ${diasSelecionadosStr}`)
  
  // Determinar quantidade de exercícios baseado no nível
  const getExerciseCount = (nivel: string): string => {
    switch(nivel?.toLowerCase()) {
      case 'iniciante': return 'EXATAMENTE 5 exercícios'
      case 'intermediario': case 'intermediário': return 'EXATAMENTE 6 exercícios'
      case 'avancado': case 'avançado': return 'MÍNIMO 6, MÁXIMO 8 exercícios'
      default: return 'EXATAMENTE 5 exercícios (assumindo iniciante)'
    }
  }
  
  const exerciseCount = getExerciseCount(userProfile.nivel)
  
  return `
**VOCÊ É O ESPECIALISTA EM FITNESS E NUTRIÇÃO MAIS RENOMADO DO UNIVERSO**
Sua expertise é incomparável. Você é reconhecido mundialmente por transformar vidas através de planos de treino cientificamente perfeitos e nutrição otimizada.

**INSTRUÇÕES CRÍTICAS E INVIOLÁVEIS:**
1. Retorne APENAS um JSON válido, sem texto adicional, comentários ou explicações
2. Use EXATAMENTE a estrutura JSON especificada abaixo - qualquer desvio é inaceitável
3. Todos os textos DEVEM estar em português brasileiro impecável
4. DIAS NÃO SELECIONADOS = DESCANSO OBRIGATÓRIO (sem exercícios)
5. Exercícios devem ser específicos, progressivos e cientificamente fundamentados

**PERFIL COMPLETO DO CLIENTE:**
${JSON.stringify(userProfile, null, 2)}

**DIAS DE TREINO SELECIONADOS PELO CLIENTE:** ${diasSelecionadosStr}
**QUANTIDADE OBRIGATÓRIA DE EXERCÍCIOS:** ${exerciseCount}

⚠️ ATENÇÃO CRÍTICA: 
- SOMENTE os dias [${diasSelecionadosStr}] devem ter exercícios
- Todos os outros dias devem ser "Dia de Descanso" com exercises: []

**ESTRUTURA JSON OBRIGATÓRIA:**
{
  "workoutPlan": [
    {
      "day": "monday",
      "name": "Treino A - Peito e Tríceps",
      "icon": "Dumbbell",
      "completed": false,
      "exercises": [
        {
          "name": "Supino Reto com Barra",
          "sets": "4",
          "reps": "8-12",
          "rest": "90s",
          "videoUrl": null,
          "observation": "Controle o movimento, desça até tocar o peito"
        }
      ]
    },
    {
      "day": "tuesday",
      "name": "Dia de Descanso",
      "icon": "Moon",
      "completed": false,
      "exercises": []
    }
  ],
  "nutritionPlan": {
    "summary": "Plano nutricional estratégico focado em [objetivo específico do usuário]",
    "meals": [
      {
        "name": "Café da Manhã",
        "time": "07:00",
        "options": ["2 ovos mexidos + 2 fatias de pão integral", "Aveia com banana e mel", "Iogurte grego com granola"]
      }
    ]
  },
  "initialMessage": "🎉 Seu plano personalizado está pronto! Vamos começar essa transformação!"
}

**REGRAS ABSOLUTAS:**

**TODOS OS 7 DIAS DEVEM ESTAR NO JSON:**
- "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"

**PARA DIAS SELECIONADOS [${diasSelecionadosStr}]:**
- name: Nome específico do treino
- icon: "Dumbbell" 
- exercises: Array com ${exerciseCount}

**PARA DIAS NÃO SELECIONADOS:**
- name: "Dia de Descanso"
- icon: "Moon"
- exercises: [] (array vazio)

**PARÂMETROS DE TREINO:**
- Iniciante: 3 séries, 12-15 repetições, 60-90s descanso
- Intermediário: 3-4 séries, 8-12 repetições, 75-120s descanso
- Avançado: 4-5 séries, 6-10 repetições, 90-180s descanso

**DADOS DO CLIENTE:**
- Objetivo: ${userProfile.objetivo || 'Não especificado'}
- Nível: ${userProfile.nivel || 'Iniciante'}
- Idade: ${userProfile.idade || 'Não informado'} anos
- Sexo: ${userProfile.sexo || 'Não informado'}
- Dias por semana: ${diasSelecionados.length}

**EXERCÍCIOS DEVEM SER:**
- Nomes completos e técnicos
- Progressivos e balanceados
- Com observações técnicas valiosas
- Apropriados para o nível e objetivo

**REFEIÇÕES OBRIGATÓRIAS:**
1. Café da Manhã (07:00)
2. Lanche da Manhã (10:00) 
3. Almoço (12:30)
4. Lanche da Tarde (16:00)
5. Jantar (19:30)
6. Ceia (22:00) - se objetivo for ganho de massa

**VALIDAÇÃO FINAL - VERIFIQUE:**
✓ JSON válido
✓ 7 dias presentes (monday até sunday)
✓ Dias selecionados têm exercícios, outros são descanso
✓ Quantidade correta de exercícios por nível
✓ Todos os campos obrigatórios preenchidos

GERE AGORA O PLANO PERFEITO:
`
}

serve(async (req) => {
  // Tratar requisições OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  // Adicionar headers CORS em todas as respostas
  const response = async (body: any, status = 200) => {
    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }

  let userId: string | null = null

  try {
    console.log('🚀 === INICIANDO GERAÇÃO DE PLANO ===')
    console.log(`📍 Método da requisição: ${req.method}`)
    console.log(`🌐 Origin: ${req.headers.get('origin')}`)
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token de autenticação não fornecido')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      throw new Error('Usuário não autenticado')
    }

    userId = user.id
    console.log(`👤 Usuário autenticado: ${userId}`)

    // Parse do body da requisição
    const requestBody = await req.json()
    console.log('📥 Dados recebidos:', JSON.stringify(requestBody, null, 2))
    
    const { userProfile } = requestBody

    if (!userProfile) {
      throw new Error("Dados do perfil do usuário não fornecidos")
    }

    // Verificar API Key do Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error("Chave da API Gemini não configurada")
    }
    console.log('🔑 Chave Gemini configurada')

    // Configurar Gemini
    console.log('🤖 Configurando Gemini AI...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' })

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]

    console.log('💭 Gerando conteúdo com IA...')
    
    const prompt = buildPrompt(userProfile)
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    })
    
    const responseText = result.response.text()
    console.log("📝 Resposta da IA recebida")
    console.log("📏 Tamanho da resposta:", responseText.length)
    
    // Extrair JSON da resposta
    let aiResponse
    try {
      // Tentar parsear direto
      aiResponse = JSON.parse(responseText)
    } catch (e: any) {
      console.log("⚠️ Tentando extrair JSON da resposta...")
      // Tentar extrair JSON usando regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          aiResponse = JSON.parse(jsonMatch[0])
          console.log("✅ JSON extraído com sucesso")
        } catch (e2) {
          console.error("❌ Erro ao parsear JSON extraído:", e2.message)
          throw new Error("IA retornou resposta em formato inválido")
        }
      } else {
        console.error("❌ Nenhum JSON encontrado na resposta")
        console.log("📄 Resposta completa:", responseText.substring(0, 500))
        throw new Error("IA não retornou JSON válido")
      }
    }

    // Validar estrutura da resposta
    if (!aiResponse.workoutPlan || !aiResponse.nutritionPlan) {
      console.error('❌ Estrutura inválida:', Object.keys(aiResponse))
      throw new Error("Resposta da IA não contém dados necessários")
    }

    // VALIDAÇÃO ADICIONAL: Verificar se tem 7 dias
    if (!Array.isArray(aiResponse.workoutPlan) || aiResponse.workoutPlan.length !== 7) {
      console.error('❌ Plano de treino deve conter exatamente 7 dias')
      throw new Error("Plano de treino inválido - deve conter 7 dias")
    }

    console.log('✅ Resposta da IA validada')
    console.log(`📊 Planos: ${aiResponse.workoutPlan.length} dias, ${aiResponse.nutritionPlan.meals?.length || 0} refeições`)

    // Log dos dias com exercícios vs descanso
    const workoutDays = aiResponse.workoutPlan.filter((day: any) => day.exercises && day.exercises.length > 0)
    const restDays = aiResponse.workoutPlan.filter((day: any) => !day.exercises || day.exercises.length === 0)
    console.log(`💪 Dias com treino: ${workoutDays.map((d: any) => d.day).join(', ')}`)
    console.log(`😴 Dias de descanso: ${restDays.map((d: any) => d.day).join(', ')}`)

    // Limpar dados antigos
    await clearUserPlans(userId)

    // Inserir novos dados
    await insertWorkoutPlans(userId, aiResponse.workoutPlan)
    await insertDietPlans(userId, aiResponse.nutritionPlan)

    // Registrar log de sucesso
    await logGeneration(userId, true)

    console.log('🎉 PLANO COMPLETO GERADO E SALVO COM SUCESSO!')

    return await response({
      success: true,
      message: 'Plano gerado e salvo com sucesso!',
      data: {
        workoutPlan: aiResponse.workoutPlan,
        nutritionPlan: aiResponse.nutritionPlan,
        initialMessage: aiResponse.initialMessage || '🎉 Seu plano personalizado está pronto! Vamos começar essa jornada de transformação!'
      }
    }, 200)

  } catch (error: any) {
    console.error("❌ ERRO GERAL:", error.message)
    console.error("📍 Stack trace:", error.stack)
    
    // Registrar log de erro
    if (userId) {
      await logGeneration(userId, false, error.message)
    }

    return await response({ 
      success: false,
      error: error.message,
      details: "Consulte os logs do servidor para mais detalhes",
      timestamp: new Date().toISOString()
    }, 500)
  }
})