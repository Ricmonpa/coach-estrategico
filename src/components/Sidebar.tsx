import { X, Target, BookOpen, User, MessageSquare, BarChart3 } from 'lucide-react';
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
      icon: MessageSquare
    },
    {
      id: 'metas' as ViewType,
      label: 'Metas',
      icon: Target
    },
    {
      id: 'recursos' as ViewType,
      label: 'Recursos',
      icon: BookOpen
    },
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard',
      icon: BarChart3
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
        className={`fixed top-0 left-0 w-96 bg-slate-900 z-50 transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          height: '100vh',
          top: '0',
          boxShadow: isOpen ? '8px 0 32px rgba(0, 0, 0, 0.6)' : 'none',
          backgroundColor: '#0f172a',
          display: isOpen ? 'block' : 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-800/80">
          <div className="flex items-center">
            <img 
              src="/brain.png" 
              alt="Brain" 
              className="w-8 h-8 object-contain"
              style={{ maxWidth: '32px', maxHeight: '32px', marginLeft: '8px', marginTop: '4px' }}
            />
          </div>
          {/* Botón de cerrar siempre visible */}
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
            style={{ 
              color: '#2563eb',
              padding: '0',
              margin: '0',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Main menu items with better spacing */}
          <div className="flex-1 p-6">
            <ul className="space-y-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-blue-600 shadow-lg shadow-blue-600/20' 
                          : 'text-blue-600 hover:bg-slate-700/40 hover:text-blue-700 hover:shadow-lg hover:shadow-slate-700/20'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
                      )}
                      
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-slate-700/60 text-blue-600 group-hover:bg-slate-600/60 group-hover:text-blue-700 group-hover:shadow-md'
                      }`}
                      style={{ marginRight: '1rem' }}>
                        <Icon className="w-5 h-5" style={{ color: isActive ? '#ffffff' : '#2563eb' }} />
                      </div>
                      <div className="text-left" style={{ marginLeft: '0.5rem' }}>
                        <div 
                          className={`sidebar-title font-semibold transition-colors duration-200 ${
                            isActive ? 'text-blue-600' : 'text-blue-600 group-hover:text-blue-700'
                          }`}
                          style={{ color: '#2563eb' }}
                        >
                          {item.label}
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
          </div>

          {/* Perfil separado al final */}
          <div className="px-6 pt-6 pb-6">
            <button
              onClick={() => onViewChange('perfil')}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                currentView === 'perfil'
                  ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-blue-600 shadow-lg shadow-blue-600/20' 
                  : 'text-blue-600 hover:bg-slate-700/40 hover:text-blue-700 hover:shadow-lg hover:shadow-slate-700/20'
              }`}
            >
              {currentView === 'perfil' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
              )}
              
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                currentView === 'perfil'
                  ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-700/60 text-blue-600 group-hover:bg-slate-600/60 group-hover:text-blue-700 group-hover:shadow-md'
              }`}
              style={{ marginRight: '1rem' }}>
                <User className="w-5 h-5" style={{ color: currentView === 'perfil' ? '#ffffff' : '#2563eb' }} />
              </div>
              <div className="text-left" style={{ marginLeft: '0.5rem' }}>
                <div 
                  className={`sidebar-title font-semibold transition-colors duration-200 ${
                    currentView === 'perfil' ? 'text-blue-600' : 'text-blue-600 group-hover:text-blue-700'
                  }`}
                  style={{ color: '#2563eb' }}
                >
                  Perfil
                </div>
              </div>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
