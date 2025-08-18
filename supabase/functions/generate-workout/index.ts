// supabase/functions/generate-workout/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const buildPrompt = (userProfile: any): string => {
  const profileJson = JSON.stringify(userProfile, null, 2);
  // *** PROMPT FINAL: Mais técnico e direto para forçar o formato. ***
  return `
    **TASK:** Analyze the user data and generate a workout and nutrition plan.
    **INPUT_DATA:**
    \`\`\`json
    ${profileJson}
    \`\`\`

    **OUTPUT_RULES:**
    1.  **RESPONSE_TYPE:** Your entire output MUST be a single, valid JSON object. Do not include any text, markdown, or explanations outside of the JSON structure.
    2.  **JSON_SCHEMA:** The output JSON object MUST strictly adhere to the following schema:
        \`\`\`json
        {
          "workoutPlan": [
            {
              "day": "string (e.g., 'monday')",
              "name": "string",
              "icon": "string ('Dumbbell', 'Target', 'Zap', or 'Award')",
              "completed": false,
              "exercises": [
                { "id": "string (e.g., 'ex1')", "name": "string", "sets": "string", "reps": "string", "rest": "string", "completed": false, "videoUrl": null, "observation": "string" }
              ]
            }
          ],
          "nutritionPlan": {
            "summary": "string",
            "meals": [
              { "name": "string", "time": "string (HH:MM)", "options": ["string", "string"] }
            ]
          },
          "initialMessage": "string"
        }
        \`\`\`
    3.  **WORKOUT_PLAN_LOGIC:**
        - Create a "workoutPlan" array entry for each day listed in the user's "preferredWorkoutDays".
        - For rest days, set "name" to "Descanso" and provide an empty "exercises" array.
        - Populate all fields for each exercise.

    **EXECUTE_TASK:** Analyze INPUT_DATA and generate the response following all OUTPUT_RULES precisely.
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();

    if (!userProfile) {
      throw new Error("Dados do perfil do usuário não fornecidos.");
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
        throw new Error("A chave de API não está configurada no servidor.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const generationConfig = {
      temperature: 0.5, // Reduzido para menos criatividade e mais precisão
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const prompt = buildPrompt(userProfile);
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const responseText = result.response.text();
    
    console.log("Conteúdo da resposta da IA:", responseText);

    try {
      JSON.parse(responseText);
    } catch (e: any) {
      console.error("ERRO CRÍTICO: A resposta da IA não é um JSON válido.", e.message);
      throw new Error("A IA retornou uma resposta em formato inválido.");
    }

    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("ERRO NO BLOCO CATCH PRINCIPAL:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
