import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, Target, TrendingUp, MessageSquare, Check, MoreVertical, Trash2 } from 'lucide-react';
import type { Notification, ViewType } from '../types/index';
import { notificationService } from '../services/notificationService';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ViewType) => void;
  isMobile?: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onViewChange, isMobile = false }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getAllNotifications();
    const unread = notificationService.getUnreadNotifications();
    setNotifications(allNotifications);
    setUnreadCount(unread.length);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
    setContextMenu(null);
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Eliminando notificación:', notificationId);
    console.log('Notificaciones antes de eliminar:', notifications.length);
    notificationService.deleteNotification(notificationId);
    console.log('Notificaciones después de eliminar:', notificationService.getAllNotifications().length);
    loadNotifications();
    setContextMenu(null);
  };

  const handleContextMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleContextMenu = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calcular posición del menú
    let x = rect.left;
    let y = rect.bottom + 5;
    
    // Ajustar posición horizontal si el menú se sale de la pantalla
    if (x + 100 > viewportWidth) {
      x = viewportWidth - 110;
    }
    
    // Ajustar posición vertical si el menú se sale de la pantalla
    if (y + 120 > viewportHeight) {
      y = rect.top - 125;
    }
    
    setContextMenu({
      id: notificationId,
      x,
      y
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    // Solo cerrar si el click no es dentro del menú contextual
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      // Verificar que el click tampoco sea en el botón que abre el menú
      const target = e.target as Element;
      if (!target.closest('[data-context-menu-trigger]')) {
        setContextMenu(null);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      onViewChange('metas');
    }
    
    onClose();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'motivation':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'reminder':
        return <Target className="w-5 h-5 text-yellow-400" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationBadgeColor = (type: Notification['type'], priority?: string) => {
    // Prioridad crítica tiene precedencia
    if (priority === 'critical') {
      return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
    }
    
    switch (type) {
      case 'achievement':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'motivation':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'reminder':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 0) {
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'hace unos minutos';
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isMobile) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setShowFloatingButton(scrollPercentage > 30);
    }
  };

  return (
    <>
      {/* Overlay con blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={onClose}
          style={{ display: isOpen ? 'block' : 'none' }}
        />
      )}
      
      {/* Panel principal */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full bg-slate-900 z-[70] transform transition-all duration-300 ease-out notification-panel flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          backgroundColor: '#0f172a',
          width: isMobile ? '100vw' : 'min(100vw, 300px)', // Full width en mobile, 300px en desktop
          right: '0', // Asegura que esté en el lado derecho
          left: 'auto', // Evita que se extienda desde la izquierda
          display: isOpen ? 'block' : 'none' // Asegurar que no se muestre cuando está cerrado
        }}
      >
        {/* Header elegante */}
        <div className="flex items-center justify-between p-4 sm:p-3 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">{unreadCount} sin leer</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Botón de debug temporal */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200 text-xs"
              title="Limpiar localStorage (debug)"
            >
              🔄
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div 
          className="flex-1 overflow-y-auto p-3 sm:p-2 pr-6 sm:pr-3 custom-scrollbar" 
          style={{ 
            minHeight: 0, // Importante para que flex funcione correctamente
            height: isMobile ? 'auto' : 'calc(100vh - 140px)' // Altura fija en desktop
          }}
          onScroll={handleScroll}
        >
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-800/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No hay notificaciones</h3>
              <p className="text-gray-400 text-sm">
                El coach te notificará sobre el progreso de tus metas
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`dashboard-card notification-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    !notification.isRead ? 'ring-2 ring-blue-500/30 bg-slate-800/50' : ''
                  }`}
                  style={{ 
                    backgroundColor: '#374151',
                    borderRadius: '1rem',
                    marginBottom: '0'
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icono con badge de tipo */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium border ${getNotificationBadgeColor(notification.type, notification.priority)}`}>
                          {notification.priority === 'critical' && '🚨 CRÍTICO'}
                          {notification.priority !== 'critical' && notification.type === 'achievement' && 'Logro'}
                          {notification.priority !== 'critical' && notification.type === 'warning' && 'Alerta'}
                          {notification.priority !== 'critical' && notification.type === 'info' && 'Info'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido de la notificación */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-base font-semibold ${
                          notification.isRead ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm leading-relaxed ${
                        notification.isRead ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Badges de acción */}
                      <div className="flex items-center space-x-2 mt-3">
                        {notification.actionRequired && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            Requiere acción
                          </span>
                        )}
                        {notification.priority === 'critical' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            🚨 CRÍTICO
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Alta prioridad
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón de menú contextual */}
                    <button
                      onClick={(e) => handleContextMenu(e, notification.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                      data-context-menu-trigger
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botón de marcar todas como leídas */}
        {notifications.length > 0 && (
          <div 
            className={`border-t border-slate-700/50 bg-slate-800/30 flex-shrink-0 ${
              isMobile ? 'p-4' : 'p-3 sm:p-2 pr-6 sm:pr-3'
            }`}
            style={{
              minHeight: isMobile ? '80px' : 'auto',
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              position: 'relative',
              zIndex: 10,
              padding: isMobile ? '1rem' : '0.75rem 1rem 0.75rem 0.75rem'
            }}
          >
            {isMobile && unreadCount > 0 && (
              <div className="text-center mb-3">
                <span className="text-sm text-gray-400">
                  {unreadCount} notificación{unreadCount > 1 ? 'es' : ''} sin leer
                </span>
              </div>
            )}
            <button
              onClick={() => {
                notifications.forEach(n => notificationService.markAsRead(n.id));
                loadNotifications();
              }}
              className={`w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 flex items-center justify-center space-x-2 ${
                isMobile ? 'px-6 py-4 text-base shadow-lg' : 'px-4 py-3'
              }`}
              style={{
                display: 'flex',
                visibility: 'visible',
                opacity: 1,
                position: 'relative',
                zIndex: 20,
                fontSize: isMobile ? '1rem' : '0.875rem',
                padding: isMobile ? '1rem 1.5rem' : '0.75rem 1rem'
              }}
            >
              <Check className="w-4 h-4" />
              <span className="font-medium">Marcar todas como leídas</span>
            </button>
          </div>
        )}
        
        {/* Botón flotante para mobile */}
        {isMobile && showFloatingButton && unreadCount > 0 && (
          <div className="fixed bottom-4 right-4 z-[90]">
            <button
              onClick={() => {
                notifications.forEach(n => notificationService.markAsRead(n.id));
                loadNotifications();
                setShowFloatingButton(false);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
              style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Menú contextual */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-[100] bg-slate-800 rounded-lg shadow-xl border border-slate-600 py-1 min-w-[200px] backdrop-blur-sm"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            <button
              onClick={(e) => handleContextMenuAction(e, () => handleMarkAsRead(contextMenu.id))}
              className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-blue-500/20 flex items-center space-x-3 transition-colors duration-200"
            >
              <Check className="w-4 h-4 text-blue-400" />
              <span>Marcar como leída</span>
            </button>
            <div className="border-t border-slate-600 my-1"></div>
            <button
              onClick={(e) => handleContextMenuAction(e, () => handleDeleteNotification(contextMenu.id))}
              className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-red-500/20 flex items-center space-x-3 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Eliminar notificación</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
