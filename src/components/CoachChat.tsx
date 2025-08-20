import { useState, useRef, useEffect } from 'react';
import { AlertCircle, SendHorizontal } from 'lucide-react';
import type { CoachResponse, ConversationMessage, Resource } from '../types/index';
import aiService from '../services/aiService';

interface CoachChatProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  onGoalSuggestion?: (goal: {
    title: string;
    metric: string;
    target: number;
    unit: string;
    reasoning: string;
  }) => void;
}

const CoachChat = ({ resources, onResourceClick, onGoalSuggestion }: CoachChatProps) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'user',
      parts: [{ text: 'Inicia como mi coach estratégico BruTaL. Presenta tu método y dame un desafío inicial.' }]
    },
    {
      role: 'model',
      parts: [{ text: JSON.stringify({
        truth: 'La mayoría de los emprendedores fracasan por falta de enfoque estratégico, no por falta de esfuerzo. El 80% de tu tiempo probablemente se gasta en actividades que generan solo el 20% de tus resultados. Necesitas identificar tu punto de apalancamiento máximo.',
        plan: [
          'Define tu objetivo más crítico para las próximas 4 semanas. Uno solo, específico y medible.',
          'Identifica las 3 actividades que más te alejan de ese objetivo y elimínalas esta semana.',
          'Establece una métrica diaria que te permita medir tu progreso hacia ese objetivo.'
        ],
        challenge: '¿Cuál es la única cosa que, si la lograras en las próximas 4 semanas, haría que todo lo demás fuera más fácil o irrelevante? Debe ser específica, medible y con un plazo agresivo.',
        suggestedResource: null,
        suggestionContext: null
      })}]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'no-key'>('checking');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService.setResources(resources);
    checkApiStatus();
  }, [resources]);

  useEffect(() => {
    if (chatRef.current) {
      // Solo hacer scroll automático si hay más de 2 mensajes (es decir, si hay conversación activa)
      if (messages.length > 2) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const status = await aiService.testConnection();
      setApiStatus(status);
    } catch (error) {
      setApiStatus('error');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      parts: [{ text: inputValue.trim() }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.getCoachResponse([...messages, userMessage]);
      const modelMessage: ConversationMessage = {
        role: 'model',
        parts: [{ text: JSON.stringify(response) }]
      };
      setMessages(prev => [...prev, modelMessage]);
      
      // Actualizar el estado de la API si la respuesta fue exitosa
      if (apiStatus !== 'connected') {
        setApiStatus('connected');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ConversationMessage = {
        role: 'model',
        parts: [{ text: JSON.stringify({
          truth: 'Error de comunicación con la IA. Pero eso no es excusa para no avanzar.',
          plan: [
            'Verifica tu conexión a internet',
            'Asegúrate de que tu API Key de Gemini esté configurada correctamente',
            'Mientras tanto, enfócate en lo que SÍ puedes controlar'
          ],
          challenge: '¿Qué acción específica puedes tomar HOY para avanzar hacia tu objetivo, independientemente de los problemas técnicos?',
          suggestedResource: null,
          suggestionContext: null
        })}]
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderApiStatus = () => {
    if (apiStatus === 'checking') {
      return null; // Ocultar el banner de verificación para mantener el layout estable
    }

    if (apiStatus === 'error') {
      return (
        <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-sm text-red-400">Error de conexión con Gemini</span>
          </div>
          <button
            onClick={checkApiStatus}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (apiStatus === 'no-key') {
      return (
        <div className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-400">API Key de Gemini no configurada</span>
          </div>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded transition-colors"
          >
            Obtener API Key
          </a>
        </div>
      );
    }

    return null;
  };

  const renderCoachResponse = (response: CoachResponse) => {
    const planList = response.plan.map((item, index) => (
      <li key={index} className="flex items-start">
        <div className="mr-3 mt-1 flex-shrink-0 w-5 h-5 border-2 border-slate-300 rounded-sm bg-transparent"></div>
        <span className="text-slate-100">{item}</span>
      </li>
    ));

    let suggestionHTML = null;
    if (response.suggestedResource && response.suggestionContext) {
      const resource = resources.find(r => r.title === response.suggestedResource);
      if (resource) {
        suggestionHTML = (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 mb-2">
              <strong>Sugerencia:</strong> {response.suggestionContext}
            </p>
            <div 
              onClick={() => onResourceClick(resource)}
              className="bg-slate-900/50 rounded-lg p-3 flex items-center cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-shrink-0 bg-slate-700 w-8 h-8 rounded-md flex items-center justify-center mr-3 text-blue-400">
                {/* Icon placeholder */}
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white">{resource.title}</h4>
              </div>
            </div>
          </div>
        );
      }
    }

    let goalSuggestionHTML = null;
    if (response.suggestedGoal) {
      goalSuggestionHTML = (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              NUEVA META SUGERIDA
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white text-lg">{response.suggestedGoal.title}</h4>
                <p className="text-slate-300 text-sm">
                  Objetivo: {response.suggestedGoal.target} {response.suggestedGoal.unit}
                </p>
                <p className="text-slate-300 text-sm">
                  Métrica: {response.suggestedGoal.metric}
                </p>
              </div>
              <p className="text-slate-400 text-sm italic">
                "{response.suggestedGoal.reasoning}"
              </p>
              {onGoalSuggestion && (
                <button
                  onClick={() => onGoalSuggestion(response.suggestedGoal!)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <span className="mr-2">➕</span>
                  Establecer esta meta
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-3xl animate-fade-in border border-slate-600/20 hover:border-slate-500/30 transition-all duration-300" style={{boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)', borderRadius: '24px', padding: '16px'}}>
        <div style={{paddingLeft: '12px', paddingRight: '12px'}}>
          <h2 className="text-xl font-black mb-5 uppercase tracking-wider" style={{color: '#60a5fa'}}>
            LA VERDAD DURA
          </h2>
          <p className="text-slate-100 mb-10 leading-relaxed">{response.truth}</p>
          
          <h2 className="text-xl font-black mb-5 uppercase tracking-wider" style={{color: '#60a5fa'}}>
            PLAN DE ACCIÓN
          </h2>
          <ul className="space-y-4 text-slate-100 mb-10">{planList}</ul>
          
          <div className="border-t border-slate-600/50 my-10"></div>
          
          <h2 className="text-xl font-black mb-5 uppercase tracking-wider" style={{color: '#60a5fa'}}>
            TU RETO
          </h2>
          <p className="text-slate-100 leading-relaxed">{response.challenge}</p>
        </div>
        
        {suggestionHTML}
        {goalSuggestionHTML}
      </div>
    );
  };

  const renderMessage = (message: ConversationMessage, index: number) => {
    if (message.role === 'user') {
      return (
        <div key={index} className="flex justify-end animate-fade-in">
          <div className="bg-blue-500 text-white rounded-xl p-6 max-w-sm" style={{ marginRight: '1rem', marginLeft: '2rem' }}>
            {message.parts[0].text}
          </div>
        </div>
      );
    } else {
      try {
        // Intentar parsear como JSON
        const response = JSON.parse(message.parts[0].text);
        
        // Verificar que tenga la estructura esperada
        if (response.truth && response.plan && response.challenge) {
                  return (
          <div key={index} className={`animate-fade-in ${index === 0 ? 'mt-8 pt-8' : ''}`} style={index === 0 ? { marginTop: '2rem', paddingTop: '2rem' } : {}}>
            {renderCoachResponse(response)}
          </div>
        );
        } else {
          // Si no tiene la estructura correcta, mostrar como texto plano
          return (
            <div key={index} className="bg-slate-800 rounded-xl p-6 shadow-lg animate-fade-in">
              <p className="text-white">{message.parts[0].text}</p>
            </div>
          );
        }
      } catch (error) {
        // Si no es JSON válido, mostrar como texto plano
        return (
          <div key={index} className="bg-slate-800 rounded-xl p-6 shadow-lg animate-fade-in">
            <p className="text-white">{message.parts[0].text}</p>
          </div>
        );
      }
    }
  };

  return (
    <div className="bg-slate-900 flex flex-col h-full relative">
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 pt-8 pb-32 space-y-6 custom-scrollbar"
      >
        {renderApiStatus()}
        {messages.slice(1).map((message, index) => renderMessage(message, index))}
        
        {isLoading && (
          <div className="animate-fade-in">
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg inline-flex items-center">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input field fijo en la parte inferior */}
      <div className="bg-gradient-to-t from-slate-800/50 to-slate-700/30 backdrop-blur-sm sticky bottom-0 left-0 right-0 z-50" style={{ padding: '0.25rem 0.75rem 1rem 0.75rem' }}>
        <div className="text-white text-sm mb-2">DEBUG: Barra de entrada visible</div>
        <div className="flex items-end justify-between">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 py-5 placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-60 focus:border-transparent shadow-2xl transition-all duration-300 text-base resize-none font-medium"
            placeholder="Reporta tu progreso..."
            disabled={isLoading || apiStatus !== 'connected'}
            style={{ 
              height: '55px', 
              borderRadius: '16px', 
              paddingLeft: '20px', 
              paddingRight: '20px', 
              marginRight: '16px',
              backgroundColor: '#374151',
              color: '#e2e8f0'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || apiStatus !== 'connected'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400/50 text-white transition-all duration-200 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#2563eb', width: '52px', height: '52px', borderRadius: '16px', marginTop: '0' }}
          >
            <SendHorizontal className="w-5 h-5" strokeWidth={2.5} stroke="white" fill="none" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
