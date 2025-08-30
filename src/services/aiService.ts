import type { CoachResponse, ConversationMessage, Resource } from '../types/index';

// Configuración de la API de Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'; // Modelo configurable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export class AIService {
  private static instance: AIService;
  private resources: Resource[] = [];

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setResources(resources: Resource[]) {
    this.resources = resources;
  }

  private buildSystemPrompt(): string {
    const resourcesList = this.resources.length > 0 
      ? this.resources.map(r => r.title).join(', ')
      : 'No hay recursos disponibles en este momento.';

    return `Actúas como mi coach estratégico personal, un constructor de imperios con un IQ de 180. Tu nombre es 'Brutalytics'. No eres un animador; eres un arma.

**Tus Principios Fundamentales:**
1. **Obsesión por los Resultados, No por el Esfuerzo:** El trabajo duro es irrelevante. La única medida del éxito son los resultados tangibles y medibles. No me hables de lo ocupado que estás. Muéstrame las métricas que has movido.
2. **Apalancamiento Asimétrico:** Ignoramos las ganancias incrementales. Buscamos exclusivamente las "apuestas asimétricas": acciones de bajo esfuerzo y alto impacto que cambian el juego. El 1% del trabajo que genera el 99% de los resultados.
3. **Guerra contra el Autoengaño:** Mi función principal es ser el espejo que no miente. Destruiré tus puntos ciegos, tus excusas y tus "métricas de vanidad". La honestidad brutal es la herramienta más rápida para el crecimiento.
4. **Pensamiento de Segundo Orden:** No resolvemos problemas superficiales. Analizamos las consecuencias de las consecuencias. Cada plan de acción debe considerar los efectos a largo plazo y los sistemas, no solo las soluciones rápidas.

**Tu Misión:**
- Forzarme a identificar y ejecutar exclusivamente sobre los puntos de máximo apalancamiento.
- Exigir evidencia cuantificable para cada afirmación de progreso.
- Desmantelar mi pensamiento a corto plazo y mis racionalizaciones.
- Proveer modelos mentales y frameworks, no como teoría, sino como armas para ser desplegadas inmediatamente.

**FLUJO DE CONVERSACIÓN OBLIGATORIO:**
1. **Primera respuesta:** Presenta tu método y da UN SOLO desafío inicial. NO diagnostiques ni recomiendes metas aún.
2. **Preguntas de seguimiento:** Haz 2-3 preguntas específicas para entender completamente la situación. Para estas preguntas, usa solo el campo "challenge" y deja "plan" vacío.
3. **Diagnóstico final:** Solo después de entender bien la situación, haz el diagnóstico brutal y recomienda metas específicas. Aquí sí usa el formato completo con "plan" lleno.

**Formato de Respuesta Obligatorio (JSON):**
Tu respuesta SIEMPRE debe estar en este formato JSON, sin excepción:

{
  "truth": "La verdad ineludible y dolorosa sobre mi situación actual.",
  "plan": ["Una lista de 2-3 acciones de máximo apalancamiento. Deben ser específicas, medibles y con plazos agresivos."],
  "challenge": "Una pregunta o tarea diseñada para llevarme al límite de mi pensamiento estratégico actual.",
  "suggestedResource": "El título exacto de un recurso de la lista si es la herramienta perfecta para el problema, o null.",
  "suggestionContext": "Una explicación concisa de por qué ese recurso es el arma que necesito AHORA para mi problema, o null."
}

Los recursos disponibles son: ${resourcesList}. No inventes nuevos.

**IMPORTANTE:** 
- En tu primera respuesta, solo presenta tu método y da UN desafío inicial. NO diagnostiques ni recomiendes metas.
- Para las preguntas de seguimiento, usa solo el campo "challenge" y deja "plan" como array vacío. Puedes dejar "truth" vacío también.
- Solo en el diagnóstico final usa el formato completo con "plan" lleno de acciones específicas y "truth" con el análisis brutal.`;
  }

  private formatConversationHistory(history: ConversationMessage[]): any[] {
    return history.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: message.parts.map(part => ({ text: part.text }))
    }));
  }

  private extractFallbackResponse(text: string): CoachResponse | null {
    try {
      // Si el texto parece ser una pregunta directa o un desafío, lo tratamos como challenge
      if (text.includes('¿') || text.includes('?')) {
        return {
          truth: "La IA está funcionando pero no está devolviendo el formato esperado. Esto es temporal.",
          plan: [
            "Revisa tu conexión a internet",
            "Verifica que tu API Key esté configurada correctamente",
            "Mientras tanto, enfócate en lo que puedes controlar"
          ],
          challenge: text.trim(),
          suggestedResource: null,
          suggestionContext: null
        };
      }

      // Intentar extraer información útil del texto aunque no sea JSON válido
      const lines = text.split('\n').filter(line => line.trim());
      
      let truth = '';
      let plan: string[] = [];
      let challenge = '';
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('verdad') || lowerLine.includes('truth') || lowerLine.includes('realidad')) {
          truth = line.replace(/^.*?[:=]\s*/, '').trim();
        } else if (lowerLine.includes('plan') || lowerLine.includes('paso') || lowerLine.includes('acción')) {
          const action = line.replace(/^.*?[:=]\s*/, '').trim();
          if (action) plan.push(action);
        } else if (lowerLine.includes('desafío') || lowerLine.includes('challenge') || lowerLine.includes('reto')) {
          challenge = line.replace(/^.*?[:=]\s*/, '').trim();
        }
      }
      
      // Si encontramos al menos algo de información útil, la usamos
      if (truth || plan.length > 0 || challenge) {
        return {
          truth: truth || "Necesito más información para darte una respuesta específica.",
          plan: plan.length > 0 ? plan : ["Reflexiona sobre lo que realmente quieres lograr"],
          challenge: challenge || "¿Qué es lo que realmente te está impidiendo avanzar?",
          suggestedResource: null,
          suggestionContext: null
        };
      }
      
      // Si no encontramos estructura específica, tratamos todo el texto como challenge
      return {
        truth: "La IA está respondiendo pero no en el formato esperado. Esto es temporal.",
        plan: [
          "Verifica tu conexión a internet",
          "Revisa la configuración de la API",
          "Mientras tanto, enfócate en lo que puedes controlar"
        ],
        challenge: text.trim() || "¿Qué es lo que realmente te está impidiendo avanzar?",
        suggestedResource: null,
        suggestionContext: null
      };
    } catch (error) {
      console.error('Error extracting fallback response:', error);
      return null;
    }
  }

  async getCoachResponse(conversationHistory: ConversationMessage[]): Promise<CoachResponse> {
    if (!API_KEY) {
      throw new Error('API Key de Gemini no configurada. Configura VITE_GEMINI_API_KEY en tu archivo .env');
    }

    const systemPrompt = this.buildSystemPrompt();
    const formattedHistory = this.formatConversationHistory(conversationHistory);

    const payload = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...formattedHistory
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Error de API Gemini: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('Respuesta completa de Gemini:', result);
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        console.error('Respuesta inválida de la API de Gemini:', result);
        throw new Error('Respuesta inválida de la API de Gemini');
      }

      if (!result.candidates[0].content.parts || !result.candidates[0].content.parts[0] || !result.candidates[0].content.parts[0].text) {
        console.error('Respuesta de Gemini sin contenido de texto:', result);
        throw new Error('Respuesta de Gemini sin contenido de texto válido');
      }

      const coachText = result.candidates[0].content.parts[0].text;
      console.log('Texto de respuesta de Gemini:', coachText);
      
      // Limpiar el texto de la respuesta (a veces viene con markdown)
      let cleanText = coachText.trim();
      
      // Remover markdown de código JSON
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      cleanText = cleanText.trim();
      
      try {
        const parsedResponse = JSON.parse(cleanText);
        
        // Validar que la respuesta tenga la estructura correcta
        // Para preguntas de seguimiento, truth puede estar vacío
        if (!parsedResponse.challenge) {
          console.error('Respuesta incompleta del coach - falta challenge:', parsedResponse);
          throw new Error('Respuesta incompleta del coach - falta challenge');
        }

        // Si es diagnóstico final (tiene plan), truth debe estar presente
        if (parsedResponse.plan && Array.isArray(parsedResponse.plan) && parsedResponse.plan.length > 0 && !parsedResponse.truth) {
          console.error('Diagnóstico final sin truth:', parsedResponse);
          throw new Error('Diagnóstico final sin truth');
        }

        return {
          truth: parsedResponse.truth,
          plan: Array.isArray(parsedResponse.plan) ? parsedResponse.plan : [],
          challenge: parsedResponse.challenge,
          suggestedResource: parsedResponse.suggestedResource || null,
          suggestionContext: parsedResponse.suggestionContext || null
        };
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Raw response:', cleanText);
        
        // Intentar extraer información útil del texto aunque no sea JSON válido
        const fallbackResponse = this.extractFallbackResponse(cleanText);
        if (fallbackResponse) {
          return fallbackResponse;
        }
        
        throw new Error('Error al procesar la respuesta del coach');
      }
    } catch (error) {
      console.error("Error en getCoachResponse:", error);
      
      // Respuesta de fallback en caso de error
      return {
        truth: "Hay un problema técnico con la IA. Pero eso no es excusa para no avanzar.",
        plan: [
          "Verifica tu conexión a internet",
          "Revisa que tu API Key de Gemini esté configurada correctamente",
          "Mientras tanto, enfócate en lo que SÍ puedes controlar"
        ],
        challenge: "¿Qué acción específica puedes tomar HOY para avanzar hacia tu objetivo, independientemente de los problemas técnicos?",
        suggestedResource: null,
        suggestionContext: null
      };
    }
  }

  // Método para probar la conexión con la API
  async testConnection(): Promise<'connected' | 'no-key' | 'error'> {
    if (!API_KEY || API_KEY === 'tu_api_key_de_gemini_aqui') {
      return 'no-key';
    }

    try {
      const testPayload = {
        contents: [{
          role: 'user',
          parts: [{ text: 'Responde solo con "OK" si puedes leer este mensaje.' }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      return response.ok ? 'connected' : 'error';
    } catch (error) {
      console.error('Error testing API connection:', error);
      return 'error';
    }
  }
}

export default AIService.getInstance();
