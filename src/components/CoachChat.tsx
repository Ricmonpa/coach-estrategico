import { useRef, useEffect } from 'react';
import { AlertCircle, SendHorizontal } from 'lucide-react';
import type { CoachResponse, ConversationMessage, Resource } from '../types/index';
import aiService from '../services/aiService';

interface CoachChatProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  isLoading: boolean;
  apiStatus: 'checking' | 'connected' | 'error' | 'no-key';
  messages: ConversationMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

const CoachChat = ({ resources, onResourceClick, isLoading, apiStatus, messages, inputValue, onInputChange, onSendMessage }: CoachChatProps) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService.setResources(resources);
    checkApiStatus();
  }, [resources]);

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading && chatRef.current) {
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    if (chatRef.current) {
      const scrollHeight = chatRef.current.scrollHeight;
      const clientHeight = chatRef.current.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;
      
      chatRef.current.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  const checkApiStatus = async () => {
    console.log('API status check requested');
  };

  const renderApiStatus = () => {
    if (apiStatus === 'checking') {
      return null;
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
              className="resource-suggestion cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-slate-700 w-8 h-8 rounded-md flex items-center justify-center mr-3 text-blue-400">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{resource.title}</h4>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="animate-fade-in">
        <div className="simple-chat-bubble">
          <div>
            <p><strong>LA VERDAD DURA:</strong> {response.truth}</p>
            <br />
            <p><strong>PLAN DE ACCIÓN:</strong></p>
            <ul>
              {response.plan.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
            <br />
            <p><strong>TU RETO:</strong> {response.challenge}</p>
          </div>
        </div>
        
        {suggestionHTML}
      </div>
    );
  };

  // Función para determinar si es un mensaje de diagnóstico final
  const isDiagnosticMessage = (response: any) => {
    // Es diagnóstico final si tiene plan de acción con elementos específicos
    return response.plan && 
           Array.isArray(response.plan) && 
           response.plan.length > 0 && 
           response.plan.some((item: string) => item.trim().length > 0);
  };

  // Función para renderizar mensaje simple del coach
  const renderSimpleCoachMessage = (text: string) => {
    return (
      <div className="animate-fade-in">
        <div className="simple-chat-bubble">
          <p>{text}</p>
        </div>
      </div>
    );
  };

  const renderMessage = (message: ConversationMessage, index: number) => {
    if (message.role === 'user') {
      return (
        <div key={index} className="flex justify-end animate-fade-in">
          <div className="chat-message-user text-white rounded-xl p-6 max-w-sm" style={{ marginRight: '1rem', marginLeft: '2rem' }}>
            {message.parts[0].text}
          </div>
        </div>
      );
    } else {
      try {
        const response = JSON.parse(message.parts[0].text);
        
        if (response.challenge) {
          // Si es diagnóstico final (tiene plan de acción), mostrar formato estructurado
          if (isDiagnosticMessage(response)) {
            return (
              <div key={index} className="animate-fade-in">
                {renderCoachResponse(response)}
              </div>
            );
          } else {
            // Si es pregunta de seguimiento, mostrar solo el challenge como mensaje simple
            return (
              <div key={index} className="animate-fade-in">
                {renderSimpleCoachMessage(response.challenge)}
              </div>
            );
          }
        } else {
          return renderSimpleCoachMessage(message.parts[0].text);
        }
      } catch (error) {
        return renderSimpleCoachMessage(message.parts[0].text);
      }
    }
  };

  return (
    <div className="chat-container bg-slate-900">
      <div 
        ref={chatRef}
        className="chat-messages-area p-4 space-y-6 custom-scrollbar pb-40"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-4 mb-4 relative" style={{ marginTop: '120px' }}>
            <img 
              src="/logo-brutal.png" 
              alt="BRUTAL Logo" 
              className="h-12 w-auto"
              style={{ maxWidth: '225px' }}
            />
          </div>
          {renderApiStatus()}
          {messages.slice(1).map((message, index) => renderMessage(message, index))}
          
          {isLoading && (
            <div className="animate-fade-in">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-area p-4 fixed bottom-0 left-0 right-0" style={{
        zIndex: 1000,
        backgroundColor: 'rgb(15 23 42)',
        borderTop: 'none',
        boxShadow: 'none',
        marginLeft: '0',
        marginRight: '0'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              className="chat-input flex-1 border-0 py-5 placeholder-white focus:outline-none focus:ring-0 focus:border-transparent shadow-2xl transition-all duration-300 text-base resize-none font-medium"
              placeholder="Reporta tu progreso..."
              disabled={isLoading}
              style={{ 
                height: '55px', 
                borderRadius: '16px', 
                paddingLeft: '20px', 
                paddingRight: '20px', 
                marginRight: '16px',
                color: '#e2e8f0',
                border: 'none',
                outline: 'none'
              }}
            />
            <button
              onClick={onSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="send-button text-white transition-all duration-200 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95"
              style={{ width: '60px', height: '60px', borderRadius: '16px', marginTop: '0' }}
            >
              <SendHorizontal 
                className="w-6 h-6" 
                strokeWidth={2.5} 
                stroke={inputValue.trim() ? "#ffffff" : "#3B82F6"} 
                fill="none" 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
