import type { Micrometa } from '../types/index';

interface MicrometaCardProps {
  micrometa: Micrometa;
  onUpdateProgress: (micrometaId: number) => void;
}

// Componente de barra de progreso reutilizable para micrometas
const MicrometaProgressBar = ({ 
  current, 
  target, 
  unit = '%',
  showPercentage = true,
  showValues = true 
}: { 
  current: number; 
  target: number; 
  unit?: string;
  showPercentage?: boolean;
  showValues?: boolean;
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = current >= target;
  
  // Determinar el color basado en el progreso
  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatValue = (value: number) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toLocaleString()}${unit}`;
  };

  return (
    <div className="space-y-2">
      <div className="progress-bar w-full">
        <div 
          className={`progress-fill ${getProgressColor()}`}
          style={{ 
            width: `${percentage}%`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
      
      <div className="flex justify-between items-center text-sm">
        {showValues && (
          <div className="text-gray-300 font-medium">
            {formatValue(current)} / {formatValue(target)}
          </div>
        )}
        {showPercentage && (
          <div className={`font-bold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

const MicrometaCard = ({ micrometa, onUpdateProgress }: MicrometaCardProps) => {
  const isCompleted = micrometa.current >= micrometa.target;
  
  // Actualizar el estado automáticamente si se completa
  const currentStatus = isCompleted ? 'Completado' : micrometa.status;

  // Determinar el color del badge de prioridad
  const getPriorityColor = () => {
    switch (micrometa.priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="micrometa-card rounded-lg p-6 animate-fade-in border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white leading-tight mb-2">{micrometa.title}</h4>
          <p className="text-sm text-gray-400 mb-3">{micrometa.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`status-badge text-xs px-3 py-1.5 rounded-full ${
            currentStatus === 'Completado' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          }`}>
            {currentStatus}
          </span>
          <span className={`priority-badge text-xs px-2 py-1 rounded-full border ${getPriorityColor()}`}>
            {micrometa.priority === 'high' ? 'Alta' : micrometa.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        </div>
      </div>
      
      <MicrometaProgressBar 
        current={micrometa.current} 
        target={micrometa.target} 
        unit={micrometa.unit}
        showValues={true}
        showPercentage={true}
      />
      
      {/* Información adicional */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Última actualización: {micrometa.lastUpdated.toLocaleDateString()}</span>
        {micrometa.deadline && (
          <span>Vence: {micrometa.deadline.toLocaleDateString()}</span>
        )}
      </div>
      
      {/* Botón para actualizar progreso */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => onUpdateProgress(micrometa.id)}
          className="bg-blue-600/40 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-full border border-blue-500/40 hover:border-blue-400 transition-all duration-200"
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.4)',
            color: 'white',
            borderColor: 'rgba(59, 130, 246, 0.4)'
          }}
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default MicrometaCard;
