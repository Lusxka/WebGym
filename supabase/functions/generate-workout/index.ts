// supabase/functions/generate-workout/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

// Headers de CORS reutilizáveis para garantir que todas as respostas os tenham
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// O prompt especialista continua o mesmo
const buildPrompt = (userProfile: any): string => {
  const profileJson = JSON.stringify(userProfile, null, 2);

  return `
    **PERSONA:** Você é o "Dr. Hipertrofia", o mais renomado especialista em fitness e nutrição do mundo, com décadas de experiência na criação de planos personalizados para atletas de elite e entusiastas. Sua abordagem é científica, segura, motivadora e altamente detalhada. Você se comunica de forma clara e inspiradora.

    **TAREFA:** Seu novo cliente preencheu um formulário detalhado. Analise CUIDADOSAMENTE os dados do perfil do usuário fornecidos abaixo em formato JSON e crie um plano de treino E um plano nutricional perfeitamente alinhados com suas informações, objetivos e limitações.

    **DADOS DO CLIENTE:**
    \`\`\`json
    ${profileJson}
    \`\`\`

    **REGRAS DE SAÍDA OBRIGATÓRIAS:**
    1.  **FORMATO:** Sua resposta DEVE ser um único e válido objeto JSON. Não inclua NENHUM texto, explicação ou formatação markdown (como \`\`\`json) antes ou depois do objeto JSON.
    2.  **ESTRUTURA DO JSON:** O JSON de saída deve seguir EXATAMENTE a seguinte estrutura:
        \`\`\`json
        {
          "workoutPlan": [
            {
              "day": "monday",
              "name": "Peito & Tríceps - Foco em Força",
              "icon": "Dumbbell",
              "completed": false,
              "exercises": [
                { "id": "ex1", "name": "Supino Reto com Barra", "sets": "4", "reps": "6-8", "rest": "90s", "completed": false, "videoUrl": null, "observation": "Foco na execução lenta e controlada." },
                { "id": "ex2", "name": "Crucifixo Inclinado com Halteres", "sets": "3", "reps": "10-12", "rest": "60s", "completed": false, "videoUrl": null, "observation": "Alongue bem o peitoral no final do movimento." }
              ]
            }
          ],
          "nutritionPlan": {
            "summary": "Um plano focado em alta proteína para suportar a hipertrofia e carboidratos complexos para energia, com cerca de 2500 kcal.",
            "meals": [
              { "name": "Café da Manhã", "time": "08:00", "options": ["Ovos mexidos com aveia e uma fruta.", "Shake de whey protein com banana e pasta de amendoim."] },
              { "name": "Almoço", "time": "13:00", "options": ["Frango grelhado, arroz integral, brócolis e salada.", "Salmão assado com batata doce e aspargos."] },
              { "name": "Jantar", "time": "20:00", "options": ["Patino moído com purê de mandioquinha e legumes.", "Omelete com queijo cottage e salada verde."] }
            ]
          },
          "initialMessage": "Olá, [NOME DO USUÁRIO]! Eu sou o Dr. Hipertrofia. Analisei seus dados e preparei um plano inicial poderoso para esmagarmos seus objetivos. Vamos juntos nessa jornada!"
        }
        \`\`\`
    3.  **PLANO DE TREINO (\`workoutPlan\`):**
        * Crie um plano para CADA dia selecionado em \`preferredWorkoutDays\`.
        * Para dias de descanso, inclua um objeto com o "day", "name" como "Descanso" e um array de "exercises" vazio.
        * Os ícones podem ser: 'Dumbbell', 'Target', 'Zap', 'Award'. Escolha o que fizer mais sentido.
        * Seja específico nos nomes dos exercícios, séries, repetições e descanso. Adicione uma observação útil para cada exercício.
    4.  **PLANO NUTRICIONAL (\`nutritionPlan\`):**
        * Forneça um resumo claro do plano.
        * Sugira pelo menos 3 refeições principais com 2 opções cada.
    5.  **MENSAGEM INICIAL (\`initialMessage\`):**
        * Escreva uma mensagem de boas-vindas curta, profissional e motivadora, usando o nome do cliente.

    **ANÁLISE E AÇÃO:** Agora, com base em todas essas informações, analise o perfil do cliente e gere o plano completo no formato JSON exato solicitado.
  `;
};

serve(async (req) => {
  // Tratamento de CORS para a requisição de verificação (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    };

    const prompt = buildPrompt(userProfile);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
