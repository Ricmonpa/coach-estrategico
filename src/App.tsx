import { useState, useEffect } from 'react';
import type { ViewType, Goal, ConversationMessage } from './types/index';
import { initialGoals, resources } from './data/initialData';
import CoachChat from './components/CoachChat';
import GoalsView from './components/GoalsView';
import ResourcesView from './components/ResourcesView';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';
import aiService from './services/aiService';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('coach');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Cambiado a true para desktop por defecto
  const [isMobile, setIsMobile] = useState(false);
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

  // Detectar si es mobile y ajustar el estado del sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint de Tailwind
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Solo se ejecuta una vez al montar el componente

  // Manejar el estado inicial del sidebar basado en el tamaño de pantalla
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // Removemos la lógica que forzaba el sidebar abierto en desktop
  }, [isMobile]); // Solo se ejecuta cuando cambia isMobile

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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // Solo cerrar el sidebar en mobile cuando se cambia de vista
    if (isMobile) {
      setIsSidebarOpen(false);
    }
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
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
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
    <div className="min-h-screen bg-slate-900 flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar - siempre visible en desktop, overlay en mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={handleViewChange}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
        isSidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm flex-shrink-0" style={{ height: '60px' }}>
          <div className="flex items-center">
            {/* Botón hamburguesa siempre visible */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-3 flex flex-col justify-center items-center transition-colors"
              style={{ width: '24px', height: '24px' }}
            >
              <div 
                style={{ 
                  width: '24px', 
                  height: '2px', 
                  backgroundColor: 'white', 
                  marginBottom: '4px',
                  borderRadius: '1px'
                }}
              ></div>
              <div 
                style={{ 
                  width: '24px', 
                  height: '2px', 
                  backgroundColor: 'white', 
                  marginBottom: '4px',
                  borderRadius: '1px'
                }}
              ></div>
              <div 
                style={{ 
                  width: '24px', 
                  height: '2px', 
                  backgroundColor: 'white',
                  borderRadius: '1px'
                }}
              ></div>
            </button>
            <h1 className="text-white text-2xl font-bold">Brutalytics</h1>
          </div>
        </header>
        
        {/* Content area */}
        <div className="flex-1 relative" style={{ backgroundColor: 'transparent' }}>
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}

export default App;
