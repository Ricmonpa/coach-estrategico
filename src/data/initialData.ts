import type { Goal, Resource, Notification, CoachReminder } from '../types/index';

export const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Incrementar MRR',
    metric: 'Ingreso Mensual Recurrente',
    current: 75000,
    target: 100000,
    unit: '$',
    status: 'En Progreso',
    createdAt: new Date('2024-01-01'),
    deadline: new Date('2024-12-31'),
    lastUpdated: new Date(),
    progressHistory: [
      { date: new Date('2024-01-01'), value: 50000 },
      { date: new Date('2024-02-01'), value: 65000 },
      { date: new Date('2024-03-01'), value: 75000 }
    ],
    reminderFrequency: 'daily',
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

export const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    title: '¡Excelente progreso en MRR!',
    message: 'Has incrementado tu MRR de $50K a $75K. ¡Estás a solo $25K de tu meta! ¿Qué estrategia te está funcionando mejor?',
    goalId: 1,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
    actionRequired: false,
    priority: 'medium'
  }
];

export const initialReminders: CoachReminder[] = [
  {
    id: '1',
    goalId: 1,
    message: '¡Hoy es un buen día para revisar tu estrategia de retención de clientes! ¿Qué puedes hacer para aumentar el MRR?',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isCompleted: false
  }
];

export const resources: Resource[] = [
  {
    id: 1,
    title: 'Matriz de Eisenhower',
    subtitle: 'Diferencia lo Urgente de lo Importante',
    icon: 'filter',
    description: 'Una herramienta para priorizar tareas dividiéndolas en cuatro cuadrantes: 1. Hacer (Urgente e Importante), 2. Planificar (No Urgente e Importante), 3. Delegar (Urgente y No Importante), 4. Eliminar (No Urgente y No Importante).'
  },
  {
    id: 2,
    title: 'Principio de Pareto (80/20)',
    subtitle: 'Enfócate en el 20% que da el 80% de resultados',
    icon: 'trending-up',
    description: 'Identifica que la mayoría de los resultados (80%) provienen de una minoría de las causas (20%). Tu misión es encontrar y explotar ese 20% vital en tu trabajo, producto, y clientes para maximizar tu impacto con el mínimo esfuerzo.'
  },
  {
    id: 3,
    title: 'Pensamiento de Primeros Principios',
    subtitle: 'Deconstruye problemas a sus verdades fundamentales',
    icon: 'box',
    description: 'En lugar de razonar por analogía (copiar lo que otros hacen), descompón un problema en sus elementos más básicos y verdades fundamentales. Luego, reconstrúyelo desde cero. Así se crean las verdaderas innovaciones.'
  },
  {
    id: 4,
    title: 'Círculo de Competencia',
    subtitle: 'Opera donde tienes una ventaja real',
    icon: 'target',
    description: 'Define honestamente y sin ego los límites de tu conocimiento. Opera solo dentro de ese círculo. La clave para evitar errores catastróficos es saber lo que no sabes y tener la disciplina de no jugar en ese terreno.'
  }
];
