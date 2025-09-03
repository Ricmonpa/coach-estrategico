import { useState, useEffect } from 'react';
import './index.css';
import { Bell } from 'lucide-react';
import type { ViewType, Goal, ConversationMessage, Resource } from './types/index';
import { initialGoals, resources, initialNotifications } from './data/initialData';
import CoachChat from './components/CoachChat';
import GoalsView from './components/GoalsView';
import ResourcesView from './components/ResourcesView';
import ProfileView from './components/ProfileView';
import CoachDashboard from './components/CoachDashboard';
import Sidebar from './components/Sidebar';
import NotificationPanel from './components/NotificationPanel';
import ToastContainer from './components/ToastContainer';
import aiService from './services/aiService';
import { notificationService } from './services/notificationService';
import { useNotifications } from './hooks/useNotifications';
import { useToast } from './contexts/ToastContext';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('coach');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Cambiado a true para desktop por defecto
  const [isMobile, setIsMobile] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'no-key'>('checking');
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Hook para manejar notificaciones automáticas
  const { requestNotificationPermission, checkCompletedGoals, checkStuckGoals } = useNotifications(goals);
  // Hook para manejar toasts
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'user',
      parts: [{ text: 'Inicia como mi coach estratégico BRUTAL. Presenta tu método y dame UN SOLO desafío inicial. Después harás varias preguntas de seguimiento para entender completamente mi situación antes de darme el diagnóstico final.' }]
    },
    {
      role: 'model',
      parts: [{ text: JSON.stringify({
        truth: '',
        plan: [],
        challenge: 'Soy Brutalytics, tu coach estratégico. Mi método es simple: identificar tu punto ciego más crítico y crear un plan de acción asimétrico. ¿Cuál es el problema más crítico que estás enfrentando en este momento? Sé específico: números, fechas, resultados concretos.',
        suggestedResource: null,
        suggestionContext: null,
        meta: null
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
    
    // Generar notificación de nueva meta creada
    const notification = notificationService.generateNewGoalNotification(goal);
    notificationService.addNotification(notification);
    updateNotificationCount();
    
    // Mostrar toast de confirmación
    showToast({
      type: 'success',
      title: '🎯 Meta Creada',
      message: `Tu meta "${goal.title}" ha sido creada exitosamente`,
      duration: 4000
    });
  };

  const handleUpdateGoal = (goalId: number, updates: Partial<Goal>) => {
    setGoals(prev => {
      const updatedGoals = prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates, lastUpdated: new Date() } : goal
      );
      
      // Verificar si alguna meta se completó después de la actualización
      setTimeout(() => {
        const completedNotifications = checkCompletedGoals();
        const stuckNotifications = checkStuckGoals();
        
        if (completedNotifications.length > 0 || stuckNotifications.length > 0) {
          updateNotificationCount();
        }
      }, 100);
      
      return updatedGoals;
    });
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

  const handleNotificationsClick = () => {
    setIsNotificationPanelOpen(true);
  };

  const handleNotificationPanelClose = () => {
    setIsNotificationPanelOpen(false);
    updateNotificationCount();
  };

  useEffect(() => {
    aiService.setResources(resources);
    checkApiStatus();
    initializeNotifications();
  }, []);

  const initializeNotifications = () => {
    // Cargar notificaciones iniciales si no existen
    const existingNotifications = notificationService.getAllNotifications();
    if (existingNotifications.length === 0) {
      initialNotifications.forEach(notification => {
        notificationService.addNotification(notification);
      });
    }
    updateNotificationCount();
    
    // Solicitar permisos de notificación
    requestNotificationPermission();
  };

  const updateNotificationCount = () => {
    const unread = notificationService.getUnreadNotifications();
    setUnreadNotificationsCount(unread.length);
  };

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const status = await aiService.testConnection();
      setApiStatus(status);
    } catch (error) {
      console.log('API check failed, setting status to error');
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
          plan: ['Verifica tu conexión a internet', 'Revisa la configuración de la API', 'Mientras tanto, enfócate en lo que SÍ puedes controlar'],
          challenge: '¿Qué acción específica puedes tomar HOY para avanzar hacia tu objetivo?',
          suggestedResource: null,
          suggestionContext: null,
          meta: 'Resuelve el problema técnico en las próximas 24 horas'
        })}]
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = (resource: Resource) => {
    showToast({
      type: 'info',
      title: 'Recurso Abierto',
      message: `Abriendo recurso: ${resource.title}`,
      duration: 3000
    });
    // Aquí podrías abrir un modal o una nueva pestaña con el recurso
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CoachDashboard
            goals={goals}
            onViewChange={handleViewChange}
          />
        );
      case 'coach':
        return (
          <CoachChat
            resources={resources}
            onResourceClick={handleResourceClick}
            onCreateGoal={handleAddGoal}
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
                {/* Header fijo */}
        <header className={`fixed top-0 z-50 flex items-center justify-between px-4 pt-4 pb-4 bg-slate-900/80 backdrop-blur-sm flex-shrink-0 transition-all duration-300 ease-out ${
          isSidebarOpen && !isMobile ? 'left-80 right-0' : 'left-0 right-0'
        }`} style={{ height: '60px' }}>
          <div className="flex items-center">
            {/* Botón hamburguesa - visible en mobile y desktop cuando sidebar está cerrado */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  marginRight: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px'
                }}
              >
                <div style={{ width: '18px', height: '2px', backgroundColor: '#3B82F6', marginBottom: '3px', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', backgroundColor: '#3B82F6', marginBottom: '3px', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', backgroundColor: '#3B82F6', borderRadius: '1px' }}></div>
              </button>
            )}
          </div>
        </header>
        
        {/* Content area */}
        <div className="flex-1 relative h-full pt-24" style={{ backgroundColor: 'transparent', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
          {renderCurrentView()}
        </div>
      </div>
      
      {/* Botón de notificaciones - siempre visible en la esquina superior derecha */}
      <button
        onClick={handleNotificationsClick}
        className="absolute top-4 right-4 z-50 text-blue-600 hover:text-blue-700 transition-colors duration-200 bg-transparent border-none outline-none p-2 rounded-lg hover:bg-slate-700/40"
        style={{ 
          color: '#3B82F6',
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 50
        }}
      >
        <Bell className="w-6 h-6" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>



      {/* Notification Panel - Solo visible cuando está abierto */}
      {isNotificationPanelOpen ? (
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={handleNotificationPanelClose}
          onViewChange={handleViewChange}
          isMobile={isMobile}
        />
      ) : null}
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default App;
