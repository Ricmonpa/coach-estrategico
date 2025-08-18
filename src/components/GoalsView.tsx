import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Goal } from '../types/index';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal?: (goalId: number, updates: Partial<Goal>) => void;
}

// Componente de barra de progreso reutilizable
const ProgressBar = ({ 
  current, 
  target, 
  unit = '$',
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

const GoalsView = ({ goals, onAddGoal, onUpdateGoal }: GoalsViewProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    metric: '',
    target: '',
    unit: ''
  });
  const [progressData, setProgressData] = useState({
    current: '',
    evidence: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      title: formData.title,
      metric: formData.metric,
      current: 0,
      target: parseFloat(formData.target),
      unit: formData.unit,
      status: 'En Progreso'
    });
    setFormData({ title: '', metric: '', target: '', unit: '' });
    setShowModal(false);
  };

  const handleProgressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoal && onUpdateGoal) {
      const newCurrent = parseFloat(progressData.current);
      const isCompleted = newCurrent >= selectedGoal.target;
      
      onUpdateGoal(selectedGoal.id, {
        current: newCurrent,
        status: isCompleted ? 'Completado' : 'En Progreso'
      });
    }
    setProgressData({ current: '', evidence: '' });
    setShowProgressModal(false);
    setSelectedGoal(null);
  };

  const openProgressModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressData({ current: goal.current.toString(), evidence: '' });
    setShowProgressModal(true);
  };

  const renderGoalCard = (goal: Goal) => {
    const isCompleted = goal.current >= goal.target;
    
    // Actualizar el estado automáticamente si se completa
    const currentStatus = isCompleted ? 'Completado' : goal.status;

    return (
      <div key={goal.id} className="goal-card rounded-lg p-10 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-white leading-tight">{goal.title}</h3>
          <span className={`status-badge text-xs px-3 py-1.5 rounded-full ${
            currentStatus === 'Completado' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          }`}>
            {currentStatus}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-8 font-medium">Métrica: {goal.metric}</p>
        <ProgressBar 
          current={goal.current} 
          target={goal.target} 
          unit={goal.unit}
          showValues={true}
          showPercentage={true}
        />
        
        {/* Botón pequeño para actualizar progreso */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => openProgressModal(goal)}
            className="bg-blue-600/40 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/40 hover:border-blue-400 transition-all duration-200"
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

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Metas Críticas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Meta
        </button>
      </div>
      
      <div className="space-y-16">
        {goals.map(renderGoalCard)}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[9999]">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Crear Nueva Meta Crítica</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  id="goalTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200"
                  placeholder="Ej: Aumentar la tasa de conversión"
                  required
                />
              </div>
              
              <div>
                <input
                  type="text"
                  id="goalMetric"
                  value={formData.metric}
                  onChange={(e) => setFormData(prev => ({ ...prev, metric: e.target.value }))}
                  className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200"
                  placeholder="Ej: Tasa de Conversión de Ventas"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    id="goalTarget"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200"
                    placeholder="Ej: 25"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="goalUnit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200"
                    placeholder="Ej: %"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-between space-x-3 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-all duration-200"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para actualizar progreso */}
      {showProgressModal && selectedGoal && (
        <div className="progress-modal">
          <div className="progress-modal-content w-full max-w-md mx-auto">
            {/* Header */}
            <div className="bg-gray-750 px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-3 text-blue-400">📊</span>
                    Actualizar Progreso
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 font-medium">{selectedGoal.title}</p>
                </div>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleProgressUpdate} className="space-y-5">
                <div>
                  <label htmlFor="progressCurrent" className="block text-sm font-semibold text-gray-300 mb-2">
                    Nuevo Valor Actual
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="progressCurrent"
                      value={progressData.current}
                      onChange={(e) => setProgressData(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 text-lg font-medium"
                      placeholder={`Ej: ${selectedGoal.unit === '$' ? '1500000' : '25'}`}
                      required
                      min="0"
                      max={selectedGoal.target * 2}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      {selectedGoal.unit}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">🎯</span>
                    Objetivo: {selectedGoal.unit === '$' ? '$' : ''}{selectedGoal.target.toLocaleString()}{selectedGoal.unit !== '$' ? selectedGoal.unit : ''}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="progressEvidence" className="block text-sm font-semibold text-gray-300 mb-2">
                    Evidencia (Nota o Enlace)
                  </label>
                  <textarea
                    id="progressEvidence"
                    value={progressData.evidence}
                    onChange={(e) => setProgressData(prev => ({ ...prev, evidence: e.target.value }))}
                    className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Ej: Cerré el cliente X, aquí está el contrato: [enlace]"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(false)}
                    className="px-6 py-2.5 rounded-lg text-gray-300 bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Enviar al Coach
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
