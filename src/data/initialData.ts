import type { Goal, Resource } from '../types/index';

export const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Cerrar Ronda Serie A',
    metric: 'Capital Recaudado',
    current: 1200000,
    target: 5000000,
    unit: '$',
    status: 'En Progreso'
  },
  {
    id: 2,
    title: 'Incrementar MRR',
    metric: 'Ingreso Mensual Recurrente',
    current: 75000,
    target: 100000,
    unit: '$',
    status: 'En Progreso'
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
