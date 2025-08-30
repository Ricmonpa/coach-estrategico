import { useEffect, useRef } from 'react';
import type { Goal } from '../types/index';
import { notificationService } from '../services/notificationService';

export const useNotifications = (goals: Goal[]) => {
  const intervalRef = useRef<number | null>(null);
  const urgentIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Verificar notificaciones cada 5 minutos
    const checkNotifications = () => {
      const newNotifications = notificationService.checkScheduledReminders(goals);
      
      // Si hay nuevas notificaciones, podrías mostrar una notificación del navegador
      if (newNotifications.length > 0) {
        // Mostrar notificación del navegador si está permitido
        if ('Notification' in window && Notification.permission === 'granted') {
          newNotifications.forEach(notification => {
            new Notification('Coach BruTaL', {
              body: notification.message,
              icon: '/brain.png',
              tag: notification.id
            });
          });
        }
      }
    };

    // Verificar metas completadas y estancadas cada 2 minutos
    const checkUrgentNotifications = () => {
      // Verificar metas completadas (para felicitaciones)
      const completedNotifications = notificationService.checkCompletedGoals(goals);
      
      // Verificar metas estancadas (para insistencia)
      const stuckNotifications = notificationService.checkStuckGoals(goals);
      
      const allUrgentNotifications = [...completedNotifications, ...stuckNotifications];
      
      if (allUrgentNotifications.length > 0) {
        // Agregar las notificaciones al sistema
        allUrgentNotifications.forEach(notification => {
          notificationService.addNotification(notification);
        });
        
        // Mostrar notificaciones del navegador para las urgentes
        if ('Notification' in window && Notification.permission === 'granted') {
          allUrgentNotifications.forEach(notification => {
            new Notification('Coach BruTaL', {
              body: notification.message,
              icon: '/brain.png',
              tag: notification.id,
              requireInteraction: notification.priority === 'critical' // Las críticas requieren interacción
            });
          });
        }
      }
    };

    // Verificar inmediatamente al cargar
    checkNotifications();
    checkUrgentNotifications();

    // Configurar intervalo para verificación periódica (cada 5 minutos)
    intervalRef.current = setInterval(checkNotifications, 5 * 60 * 1000);
    
    // Configurar intervalo para verificación urgente (cada 2 minutos)
    urgentIntervalRef.current = setInterval(checkUrgentNotifications, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (urgentIntervalRef.current) {
        clearInterval(urgentIntervalRef.current);
      }
    };
  }, [goals]);

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Función para generar notificación manual
  const generateManualNotification = (goal: Goal) => {
    const notification = notificationService.generateGoalNotification(goal);
    notificationService.addNotification(notification);
    return notification;
  };

  // Función para limpiar notificaciones antiguas
  const cleanupOldNotifications = () => {
    notificationService.cleanupOldNotifications();
  };

  // Función para verificar metas completadas manualmente
  const checkCompletedGoals = () => {
    return notificationService.checkCompletedGoals(goals);
  };

  // Función para verificar metas estancadas manualmente
  const checkStuckGoals = () => {
    return notificationService.checkStuckGoals(goals);
  };

  return {
    requestNotificationPermission,
    generateManualNotification,
    cleanupOldNotifications,
    checkCompletedGoals,
    checkStuckGoals
  };
};
