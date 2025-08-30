import type { Goal, Notification, CoachReminder } from '../types/index';

export class NotificationService {
  private notifications: Notification[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    // En una implementación real, esto vendría de localStorage o una API
    const stored = localStorage.getItem('coach-notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
    }
  }

  private saveNotifications() {
    localStorage.setItem('coach-notifications', JSON.stringify(this.notifications));
  }

  // Detectar metas estancadas (sin progreso en los últimos 7 días)
  private isGoalStuck(goal: Goal): boolean {
    if (goal.progressHistory.length < 2) return false;
    
    const lastUpdate = goal.lastUpdated;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return lastUpdate < sevenDaysAgo && goal.status === 'En Progreso';
  }

  // Detectar metas que necesitan atención urgente
  private needsUrgentAttention(goal: Goal): boolean {
    const progress = (goal.current / goal.target) * 100;
    const daysUntilDeadline = goal.deadline 
      ? Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    // Meta estancada con deadline próximo
    if (this.isGoalStuck(goal) && daysUntilDeadline && daysUntilDeadline <= 14) {
      return true;
    }

    // Progreso muy bajo con deadline próximo
    if (progress < 50 && daysUntilDeadline && daysUntilDeadline <= 30) {
      return true;
    }

    return false;
  }

  // Generar notificación automática basada en el progreso de una meta
  generateGoalNotification(goal: Goal): Notification {
    const progress = (goal.current / goal.target) * 100;
    const daysUntilDeadline = goal.deadline 
      ? Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    let type: Notification['type'] = 'reminder';
    let title = '';
    let message = '';

    // 🎉 FELICITACIÓN AL 100% - PRIORIDAD MÁXIMA
    if (progress >= 100 && goal.status !== 'Completado') {
      type = 'achievement';
      title = `🎉 ¡META COMPLETADA: ${goal.title}!`;
      message = `¡BRUTAL! Has alcanzado el 100% de tu meta "${goal.title}". Eres una máquina de resultados. ¿Cuál será tu próximo desafío? ¡No te detengas ahora!`;
      return {
        id: `notification-${Date.now()}`,
        type,
        title,
        message,
        goalId: goal.id,
        createdAt: new Date(),
        isRead: false,
        actionRequired: false,
        actionUrl: '/metas',
        priority: 'critical'
      };
    }

    // 🚨 ATENCIÓN URGENTE - Meta estancada o en riesgo
    if (this.needsUrgentAttention(goal)) {
      type = 'warning';
      title = `🚨 ATENCIÓN URGENTE: ${goal.title}`;
      message = `¡ALERTA! Tu meta "${goal.title}" necesita atención inmediata. ${this.isGoalStuck(goal) ? 'No has reportado progreso en 7 días.' : 'Progreso muy bajo con deadline próximo.'} ¿Qué está bloqueando tu avance? Necesito que actúes HOY.`;
      return {
        id: `notification-${Date.now()}`,
        type,
        title,
        message,
        goalId: goal.id,
        createdAt: new Date(),
        isRead: false,
        actionRequired: true,
        actionUrl: '/metas',
        priority: 'critical'
      };
    }

    // 📈 CASI LO LOGRAS - Progreso alto
    if (progress >= 80) {
      type = 'motivation';
      title = `📈 ¡Casi lo logras: ${goal.title}`;
      message = `¡Excelente progreso! Estás al ${progress.toFixed(1)}% de tu meta. El último esfuerzo es el más importante. ¿Qué necesitas para cruzar la meta? ¡No aflojes ahora!`;
    } 
    // ⚠️ DEADLINE PRÓXIMO
    else if (daysUntilDeadline && daysUntilDeadline <= 7) {
      type = 'warning';
      title = `⚠️ ¡Urgente: ${goal.title}`;
      message = `¡Atención! Solo quedan ${daysUntilDeadline} días para tu deadline. Estás al ${progress.toFixed(1)}% de tu meta. ¿Necesitas ayuda para acelerar el progreso?`;
    } 
    // 🚀 EMPEZANDO - Progreso bajo
    else if (progress < 30) {
      type = 'motivation';
      title = `🚀 ¡Empieza fuerte: ${goal.title}`;
      message = `Veo que estás comenzando con ${goal.title}. ¿Qué obstáculos has identificado? ¿Cómo puedo ayudarte a avanzar más rápido? ¡No te quedes en la zona de confort!`;
    } 
    // 📊 SEGUIMIENTO GENERAL
    else {
      type = 'reminder';
      title = `📊 Actualización: ${goal.title}`;
      message = `¿Cómo va el progreso con ${goal.title}? Estás al ${progress.toFixed(1)}% de tu meta. ¿Qué necesitas para mantener el momentum?`;
    }

    return {
      id: `notification-${Date.now()}`,
      type,
      title,
      message,
      goalId: goal.id,
      createdAt: new Date(),
      isRead: false,
      actionRequired: type === 'warning' || type === 'reminder',
      actionUrl: '/metas'
    };
  }

  // Generar notificación de nueva meta creada
  generateNewGoalNotification(goal: Goal): Notification {
    return {
      id: `notification-${Date.now()}`,
      type: 'info',
      title: `🎯 ¡Nueva meta establecida: ${goal.title}!`,
      message: `Has creado exitosamente tu meta "${goal.title}" con objetivo de ${goal.target} ${goal.unit}. La meta está ahora en seguimiento activo. ¡Es hora de empezar a trabajar!`,
      goalId: goal.id,
      createdAt: new Date(),
      isRead: false,
      actionRequired: false,
      actionUrl: '/metas',
      priority: 'high'
    };
  }

  // Generar recordatorio programado con sistema de insistencia
  generateScheduledReminder(goal: Goal): CoachReminder {
    const isStuck = this.isGoalStuck(goal);
    const needsUrgent = this.needsUrgentAttention(goal);
    const progress = (goal.current / goal.target) * 100;

    let messages: string[];
    let motivationType: 'encouragement' | 'challenge' | 'reflection' | 'celebration' | 'urgent';

    if (needsUrgent) {
      motivationType = 'urgent';
      messages = [
        `🚨 URGENTE: ${goal.title} necesita atención inmediata. ¿Qué estás haciendo HOY para avanzar?`,
        `⚠️ ALERTA: ${goal.title} está en riesgo. ¿Cuál es tu plan de acción para los próximos 3 días?`,
        `🔥 CRÍTICO: ${goal.title} requiere acción inmediata. ¿Qué obstáculo vas a eliminar hoy?`
      ];
    } else if (isStuck) {
      motivationType = 'challenge';
      messages = [
        `💪 ¿Estás desafiándote lo suficiente con ${goal.title}? A veces necesitamos salir de nuestra zona de confort.`,
        `🎯 ¿Qué obstáculo te está impidiendo avanzar más rápido en ${goal.title}?`,
        `⚡ ¿Has considerado todas las opciones para acelerar ${goal.title}?`
      ];
    } else if (progress >= 80) {
      motivationType = 'celebration';
      messages = [
        `🎉 ¡Excelente trabajo en ${goal.title}! ¿Qué te gustaría celebrar hoy?`,
        `🏆 Has hecho un progreso significativo en ${goal.title}. ¿Qué te hace sentir más orgulloso?`,
        `⭐ ¡Bien hecho! ${goal.title} está avanzando. ¿Qué estrategia te está funcionando mejor?`
      ];
    } else {
      motivationType = 'encouragement';
      messages = [
        `💪 ¿Cómo va el progreso con ${goal.title}? Recuerda que cada pequeño paso cuenta.`,
        `🚀 ¡Hoy es un buen día para avanzar en ${goal.title}! ¿Qué puedes hacer diferente?`,
        `📈 Veo que has progresado en ${goal.title}. ¿Qué te está funcionando mejor?`
      ];
    }

    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: `reminder-${Date.now()}`,
      goalId: goal.id,
      message: selectedMessage,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      sent: false,
      motivationType
    };
  }

  // Verificar metas completadas y generar felicitaciones
  checkCompletedGoals(goals: Goal[]): Notification[] {
    const newNotifications: Notification[] = [];
    
    goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      
      // Si la meta está al 100% pero no está marcada como completada
      if (progress >= 100 && goal.status !== 'Completado') {
        const notification = this.generateGoalNotification(goal);
        newNotifications.push(notification);
      }
    });

    return newNotifications;
  }

  // Verificar metas que necesitan insistencia
  checkStuckGoals(goals: Goal[]): Notification[] {
    const newNotifications: Notification[] = [];
    
    goals.forEach(goal => {
      if (this.needsUrgentAttention(goal)) {
        const notification = this.generateGoalNotification(goal);
        newNotifications.push(notification);
      }
    });

    return newNotifications;
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Eliminar notificación
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Agregar nueva notificación
  addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.saveNotifications();
  }

  // Obtener todas las notificaciones
  getAllNotifications(): Notification[] {
    return this.notifications;
  }

  // Verificar si hay recordatorios pendientes
  checkScheduledReminders(goals: Goal[]): Notification[] {
    const now = new Date();
    const newNotifications: Notification[] = [];

    goals.forEach(goal => {
      if (goal.nextReminder && goal.nextReminder <= now) {
        const notification = this.generateGoalNotification(goal);
        newNotifications.push(notification);
        
        // Programar próximo recordatorio
        const nextReminderDate = this.calculateNextReminder(goal);
        goal.nextReminder = nextReminderDate;
      }
    });

    // Agregar las nuevas notificaciones
    newNotifications.forEach(notification => {
      this.addNotification(notification);
    });

    return newNotifications;
  }

  private calculateNextReminder(goal: Goal): Date {
    const now = new Date();
    
    // Si la meta necesita atención urgente, recordar más frecuentemente
    if (this.needsUrgentAttention(goal)) {
      return new Date(now.getTime() + 12 * 60 * 60 * 1000); // Cada 12 horas
    }
    
    // Si está estancada, recordar diariamente
    if (this.isGoalStuck(goal)) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Diario
    }
    
    switch (goal.reminderFrequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Limpiar notificaciones antiguas (más de 30 días)
  cleanupOldNotifications(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.createdAt > thirtyDaysAgo);
    this.saveNotifications();
  }
}

export const notificationService = new NotificationService();
