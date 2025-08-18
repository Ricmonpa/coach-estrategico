import type { CoachResponse, ConversationMessage, Resource } from '../types/index';

// Configuración de la API de Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'; // Modelo configurable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export class AIService {
  private static instance: AIService;
  private resources: Resource[] = [];
  private conversationContext: string = '';

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

  setConversationContext(context: string) {
    this.conversationContext = context;
  }

  private buildSystemPrompt(): string {
    const resourcesList = this.resources.length > 0 
      ? `Recursos disponibles: ${this.resources.map(r => `"${r.title}"`).join(', ')}`
      : 'No hay recursos disponibles en este momento.';

    return `Eres un coach estratégico personal BRUTALMENTE honesto y directo. Tu personalidad:

**CARACTERÍSTICAS:**
- IQ de 180, experiencia en construir empresas multimillonarias
- Profundo conocimiento en psicología, estrategia y ejecución
- NO toleras excusas, solo resultados
- Enfocado en puntos de apalancamiento máximo
- Piensas en sistemas y causas raíz
- Eres directo, pero constructivo

**FORMATO DE RESPUESTA:**
Responde SIEMPRE en JSON válido con esta estructura exacta:
{
  "truth": "La verdad dura y directa sobre la situación",
  "plan": ["Paso 1", "Paso 2", "Paso 3"],
  "challenge": "Un desafío específico y directo",
  "suggestedResource": "Título exacto del recurso o null",
  "suggestionContext": "Por qué este recurso es relevante o null",
  "suggestedGoal": {
    "title": "Título de la meta sugerida",
    "metric": "Métrica específica a medir",
    "target": número,
    "unit": "Unidad de medida",
    "reasoning": "Por qué esta meta es importante ahora"
  } o null
}

**REGLAS PARA SUGERIR METAS:**
- Solo sugiere una meta cuando sea apropiado y relevante al tema discutido
- La meta debe estar alineada con el método o estrategia recomendada
- Debe ser específica, medible y alcanzable
- Incluye siempre el reasoning que explique por qué esta meta es importante ahora
- Si no es apropiado sugerir una meta, usa null

**CONTEXTO ACTUAL:** ${this.conversationContext}
**${resourcesList}**

Recuerda: Sé brutalmente honesto, pero siempre constructivo. Enfócate en acciones específicas y medibles.`;
  }

  private formatConversationHistory(history: ConversationMessage[]): any[] {
    return history.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: message.parts.map(part => ({ text: part.text }))
    }));
  }

  private extractFallbackResponse(text: string): CoachResponse | null {
    try {
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
          suggestionContext: null,
          suggestedGoal: null
        };
      }
      
      return null;
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
      const cleanText = coachText.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedResponse = JSON.parse(cleanText);
        
        // Validar que la respuesta tenga la estructura correcta
        if (!parsedResponse.truth || !parsedResponse.plan || !parsedResponse.challenge) {
          console.error('Respuesta incompleta del coach:', parsedResponse);
          throw new Error('Respuesta incompleta del coach');
        }

        return {
          truth: parsedResponse.truth,
          plan: Array.isArray(parsedResponse.plan) ? parsedResponse.plan : [],
          challenge: parsedResponse.challenge,
          suggestedResource: parsedResponse.suggestedResource || null,
          suggestionContext: parsedResponse.suggestionContext || null,
          suggestedGoal: parsedResponse.suggestedGoal || null
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
        suggestionContext: null,
        suggestedGoal: null
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
