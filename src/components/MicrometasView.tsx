import { useState } from 'react';
import { ArrowLeft, Plus, Target } from 'lucide-react';
import type { Goal, Micrometa, MicrometaProgressData } from '../types/index';
import MicrometaCard from './MicrometaCard';
import MicrometaProgressModal from './MicrometaProgressModal';

interface MicrometasViewProps {
  parentGoal: Goal;
  micrometas: Micrometa[];
  onBack: () => void;
  onUpdateMicrometa: (micrometaId: number, updates: Partial<Micrometa>) => void;
}

const MicrometasView = ({ parentGoal, micrometas, onBack, onUpdateMicrometa }: MicrometasViewProps) => {
  const [selectedMicrometa, setSelectedMicrometa] = useState<Micrometa | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleUpdateProgress = (micrometaId: number) => {
    console.log('🔍 Botón Actualizar clickeado para micrometa ID:', micrometaId);
    const micrometa = micrometas.find(m => m.id === micrometaId);
    console.log('📋 Micrometa encontrada:', micrometa);
    if (micrometa) {
      setSelectedMicrometa(micrometa);
      setShowProgressModal(true);
      console.log('✅ Modal abierto para micrometa:', micrometa.title);
    } else {
      console.error('❌ No se encontró la micrometa con ID:', micrometaId);
    }
  };

  const handleProgressSubmit = async (data: MicrometaProgressData) => {
    if (!selectedMicrometa) return;

    const isCompleted = data.newValue >= selectedMicrometa.target;
    
    // Crear nueva entrada de progreso
    const newProgressEntry = {
      date: new Date(),
      value: data.newValue,
      notes: data.notes,
      evidence: data.evidence,
      links: data.links
    };

    // Actualizar la micrometa
    const updatedMicrometa: Partial<Micrometa> = {
      current: data.newValue,
      status: isCompleted ? 'Completado' : 'En Progreso',
      lastUpdated: new Date(),
      progressHistory: [...selectedMicrometa.progressHistory, newProgressEntry]
    };

    onUpdateMicrometa(selectedMicrometa.id, updatedMicrometa);
  };

  const handleCloseModal = () => {
    console.log('🚪 Cerrando modal de progreso');
    setShowProgressModal(false);
    setSelectedMicrometa(null);
  };

  // Calcular estadísticas generales
  const totalMicrometas = micrometas.length;
  const completedMicrometas = micrometas.filter(m => m.status === 'Completado').length;
  const overallProgress = totalMicrometas > 0 ? (completedMicrometas / totalMicrometas) * 100 : 0;

  // Agrupar micrometas por prioridad
  const micrometasByPriority = {
    high: micrometas.filter(m => m.priority === 'high'),
    medium: micrometas.filter(m => m.priority === 'medium'),
    low: micrometas.filter(m => m.priority === 'low')
  };

  const renderMicrometasByPriority = (priority: 'high' | 'medium' | 'low', micrometas: Micrometa[]) => {
    if (micrometas.length === 0) return null;

    const priorityLabels = {
      high: { label: 'Alta Prioridad', color: 'text-red-400', icon: '🔴' },
      medium: { label: 'Media Prioridad', color: 'text-yellow-400', icon: '🟡' },
      low: { label: 'Baja Prioridad', color: 'text-green-400', icon: '🟢' }
    };

    return (
      <div key={priority} className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{priorityLabels[priority].icon}</span>
          <h3 className={`text-lg font-bold ${priorityLabels[priority].color}`}>
            {priorityLabels[priority].label}
          </h3>
          <span className="ml-2 text-sm text-gray-400">({micrometas.length})</span>
        </div>
        <div className="space-y-4">
          {micrometas.map(micrometa => (
            <MicrometaCard
              key={micrometa.id}
              micrometa={micrometa}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full overflow-y-auto p-6 custom-scrollbar relative micrometas-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 micrometas-header">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-white micrometas-title">
                  Micrometas
                </h2>
                <p className="text-gray-400 mt-1">Meta: {parentGoal.title}</p>
              </div>
            </div>
            <button
              onClick={() => {/* TODO: Implementar agregar micrometa */}}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center transition-all duration-200 micrometas-add-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Micrometa
            </button>
          </div>

          {/* Estadísticas generales */}
          <div className="progress-general-card bg-gray-800/50 rounded-3xl p-6 mb-8 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Target className="w-6 h-6 mr-3 text-blue-400" />
                Progreso General
              </h3>
              <span className="text-2xl font-bold text-blue-400">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar w-full mb-4">
              <div 
                className="progress-fill bg-blue-500"
                style={{ 
                  width: `${overallProgress}%`,
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{completedMicrometas} de {totalMicrometas} completadas</span>
              <span>{totalMicrometas - completedMicrometas} pendientes</span>
            </div>
          </div>
          
          {/* Lista de micrometas por prioridad */}
          <div className="micrometas-list">
            {renderMicrometasByPriority('high', micrometasByPriority.high)}
            {renderMicrometasByPriority('medium', micrometasByPriority.medium)}
            {renderMicrometasByPriority('low', micrometasByPriority.low)}
            
            {totalMicrometas === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No hay micrometas</h3>
                <p className="text-gray-500 mb-6">
                  Esta meta aún no tiene micrometas definidas. ¡Agrega algunas para comenzar!
                </p>
                <button
                  onClick={() => {/* TODO: Implementar agregar micrometa */}}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center transition-all duration-200 mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primera Micrometa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de progreso */}
      {selectedMicrometa && (
        <>
          {console.log('🎭 Renderizando modal para micrometa:', selectedMicrometa.title, 'isOpen:', showProgressModal)}
          <MicrometaProgressModal
            micrometa={selectedMicrometa}
            isOpen={showProgressModal}
            onClose={handleCloseModal}
            onSubmit={handleProgressSubmit}
          />
        </>
      )}
    </>
  );
};

export default MicrometasView;
