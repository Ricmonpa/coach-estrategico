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
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000),
    micrometas: [
      {
        id: 1,
        parentGoalId: 1,
        title: 'Pricing Strategy',
        description: 'Optimizar estrategia de precios para aumentar conversión y valor por cliente',
        current: 0,
        target: 100,
        unit: '%',
        status: 'En Progreso',
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-01-01'),
        progressHistory: [],
        deadline: new Date('2024-03-31')
      },
      {
        id: 2,
        parentGoalId: 1,
        title: 'Customer Retention',
        description: 'Implementar estrategias de retención de clientes para reducir churn',
        current: 25,
        target: 100,
        unit: '%',
        status: 'En Progreso',
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-01-15'),
        progressHistory: [
          {
            date: new Date('2024-01-15'),
            value: 25,
            notes: 'Implementé sistema de seguimiento de churn y análisis de cohortes',
            evidence: 'Configuré analytics para tracking de retención y identifiqué patrones de abandono',
            links: ['https://analytics.example.com/dashboard']
          }
        ],
        deadline: new Date('2024-04-30')
      },
      {
        id: 3,
        parentGoalId: 1,
        title: 'Sales Process',
        description: 'Mejorar proceso de ventas para aumentar tasa de conversión',
        current: 60,
        target: 100,
        unit: '%',
        status: 'En Progreso',
        priority: 'medium',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-02-01'),
        progressHistory: [
          {
            date: new Date('2024-02-01'),
            value: 60,
            notes: 'Automaticé el seguimiento de leads y mejoré el proceso de onboarding',
            evidence: 'Implementé CRM automatizado y flujo de seguimiento post-venta',
            links: ['https://crm.example.com/leads']
          }
        ],
        deadline: new Date('2024-05-15')
      },
      {
        id: 4,
        parentGoalId: 1,
        title: 'Product Features',
        description: 'Desarrollar nuevas funcionalidades que aumenten el valor del producto',
        current: 40,
        target: 100,
        unit: '%',
        status: 'En Progreso',
        priority: 'medium',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-01-20'),
        progressHistory: [
          {
            date: new Date('2024-01-20'),
            value: 40,
            notes: 'Lancé integración con API externa y mejoré la interfaz de usuario',
            evidence: 'Nueva funcionalidad disponible en producción con feedback positivo',
            links: ['https://product.example.com/features']
          }
        ],
        deadline: new Date('2024-06-30')
      },
      {
        id: 5,
        parentGoalId: 1,
        title: 'Marketing Campaigns',
        description: 'Ejecutar campañas de marketing dirigidas para generar más leads calificados',
        current: 15,
        target: 100,
        unit: '%',
        status: 'En Progreso',
        priority: 'low',
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date('2024-01-10'),
        progressHistory: [
          {
            date: new Date('2024-01-10'),
            value: 15,
            notes: 'Configuré campañas en Google Ads y LinkedIn',
            evidence: 'Campañas activas con métricas iniciales de conversión',
            links: ['https://ads.google.com/campaigns']
          }
        ],
        deadline: new Date('2024-07-31')
      }
    ]
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
