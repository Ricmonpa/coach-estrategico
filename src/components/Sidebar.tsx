import { X, Target, BookOpen, User, MessageSquare } from 'lucide-react';
import type { ViewType } from '../types/index';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isMobile: boolean;
}

const Sidebar = ({ isOpen, onClose, currentView, onViewChange, isMobile }: SidebarProps) => {
  const menuItems = [
    {
      id: 'coach' as ViewType,
      label: 'Coach',
      icon: MessageSquare,
      description: 'Chat estratégico'
    },
    {
      id: 'metas' as ViewType,
      label: 'Metas',
      icon: Target,
      description: 'Gestionar objetivos'
    },
    {
      id: 'recursos' as ViewType,
      label: 'Recursos',
      icon: BookOpen,
      description: 'Biblioteca de contenido'
    },
    {
      id: 'perfil' as ViewType,
      label: 'Perfil',
      icon: User,
      description: 'Configuración personal'
    }
  ];

  return (
    <>
      {/* Overlay solo en mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-all duration-300 ease-out"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 z-50 transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 border-r border-slate-700/50' : '-translate-x-full'
        }`}
        style={{ 
          boxShadow: isOpen ? '8px 0 32px rgba(0, 0, 0, 0.6)' : 'none',
          backgroundColor: '#0f172a',
          display: isOpen ? 'block' : 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 
              className="text-xl font-bold text-blue-600"
              style={{ color: '#2563eb' }}
            >
              Brutalytics
            </h2>
          </div>
          {/* Botón de cerrar siempre visible */}
          <button
            onClick={onClose}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ color: '#2563eb' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 flex-1">
          <div className="mb-4">
            <h3 
              className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3 px-2"
              style={{ color: '#2563eb' }}
            >
              Navegación
            </h3>
          </div>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/40 text-blue-600 shadow-lg shadow-blue-600/20' 
                        : 'text-blue-600 hover:bg-slate-700/40 hover:text-blue-700 hover:shadow-lg hover:shadow-slate-700/20'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
                    )}
                    
                    <div className={`mr-4 p-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-700/60 text-blue-600 group-hover:bg-slate-600/60 group-hover:text-blue-700 group-hover:shadow-md'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div 
                        className={`font-semibold transition-colors duration-200 ${
                          isActive ? 'text-blue-600' : 'text-blue-600 group-hover:text-blue-700'
                        }`}
                        style={{ color: '#2563eb' }}
                      >
                        {item.label}
                      </div>
                      <div 
                        className={`text-sm transition-colors duration-200 ${
                          isActive ? 'text-blue-600/90' : 'text-blue-600/70 group-hover:text-blue-700'
                        }`}
                        style={{ color: 'rgba(37, 99, 235, 0.7)' }}
                      >
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-white/5 rounded-xl transition-opacity duration-200 ${
                      isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                    }`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-800/60">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
              <div 
                className="text-sm font-semibold text-blue-600"
                style={{ color: '#2563eb' }}
              >
                Brutalytics
              </div>
            </div>
            <div 
              className="text-xs text-blue-600/80"
              style={{ color: 'rgba(37, 99, 235, 0.8)' }}
            >
              Tu coach estratégico personal
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
