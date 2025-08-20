import { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import type { ViewType, Goal, ConversationMessage } from './types/index';
import { initialGoals, resources } from './data/initialData';
import CoachChat from './components/CoachChat';
import GoalsView from './components/GoalsView';
import ResourcesView from './components/ResourcesView';
import ProfileView from './components/ProfileView';
import Navigation from './components/Navigation';
import aiService from './services/aiService';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('coach');
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'no-key'>('checking');
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

  const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now()
    };
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoal = (goalId: number, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const handleSaveProfile = (data: { mission: string; values: string }) => {
    // TODO: Implement profile saving
    console.log('Profile saved:', data);
  };

  useEffect(() => {
    aiService.setResources(resources);
    checkApiStatus();
  }, []);

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'coach':
        return (
          <CoachChat
            resources={resources}
            onResourceClick={() => {}}
            onGoalSuggestion={(suggestedGoal) => {
              const newGoal: Goal = {
                id: Date.now(),
                title: suggestedGoal.title,
                metric: suggestedGoal.metric,
                current: 0,
                target: suggestedGoal.target,
                unit: suggestedGoal.unit,
                status: 'En Progreso'
              };
              setGoals(prev => [...prev, newGoal]);
              setCurrentView('metas'); // Cambiar a la vista de metas para ver la nueva meta
            }}
            isLoading={isLoading}
            apiStatus={apiStatus}
            messages={messages}
          />
        );
      case 'metas':
        return (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        );
      case 'recursos':
        return (
          <ResourcesView
            resources={resources}
          />
        );
      case 'perfil':
        return (
          <ProfileView
            onSaveProfile={handleSaveProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex md:justify-center md:items-start" style={{ minHeight: '100vh' }}>
      <div className="w-full bg-slate-900 flex flex-col desktop-compact" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Header - Fixed at top */}
        <header className="flex items-center p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10" style={{ height: '60px', minHeight: '60px', overflow: 'visible' }}>
          <div className="flex items-center pl-6">
            <h1 className="text-white text-2xl font-bold">Brutalytics</h1>
          </div>

        </header>
        
        {/* Content area - Takes remaining space between header and bottom nav */}
        <div className="overflow-hidden content-area" style={{ height: 'calc(100vh - 60px - 80px)', flex: '1', overflow: 'hidden', position: 'relative', zIndex: '1', backgroundColor: 'transparent', minHeight: '200px' }}>
          {renderCurrentView()}
        </div>

        {/* Bottom Navigation - Fixed at bottom */}
        <Navigation 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Input field fijo en la parte inferior - fuera del content area */}
      {currentView === 'coach' && (
        <div className="bg-gradient-to-t from-slate-800/50 to-slate-700/30 backdrop-blur-sm fixed bottom-20 left-0 right-0 z-50" style={{ padding: '0.25rem 0.75rem 1rem 0.75rem' }}>
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
      )}
    </div>
  );
}

export default App;
