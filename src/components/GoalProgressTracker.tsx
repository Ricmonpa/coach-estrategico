import React, { useState } from 'react';
import { TrendingUp, Clock, Plus } from 'lucide-react';
import type { Goal, ProgressEntry } from '../types/index';

interface GoalProgressTrackerProps {
  goal: Goal;
  onUpdateGoal: (goalId: number, updates: Partial<Goal>) => void;
}

const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({ goal, onUpdateGoal }) => {
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [newProgressValue, setNewProgressValue] = useState('');
  const [newProgressNotes, setNewProgressNotes] = useState('');

  const progress = (goal.current / goal.target) * 100;
  const daysUntilDeadline = goal.deadline 
    ? Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleAddProgress = () => {
    if (!newProgressValue.trim()) return;

    const newValue = parseFloat(newProgressValue);
    if (isNaN(newValue)) return;

    const newEntry: ProgressEntry = {
      date: new Date(),
      value: newValue,
      notes: newProgressNotes.trim() || undefined
    };

    const updatedProgressHistory = [...goal.progressHistory, newEntry];
    
    onUpdateGoal(goal.id, {
      current: newValue,
      lastUpdated: new Date(),
      progressHistory: updatedProgressHistory
    });

    setNewProgressValue('');
    setNewProgressNotes('');
    setIsAddingProgress(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-500';
    if (progress >= 80) return 'text-blue-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
          <p className="text-gray-400">{goal.metric}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getProgressColor(progress)}`}>
            {progress.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progreso</span>
          <span className="text-gray-400">{goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(progress)}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Deadline Info */}
      {goal.deadline && (
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Deadline:</span>
          <span className={`font-medium ${daysUntilDeadline && daysUntilDeadline <= 7 ? 'text-red-400' : 'text-white'}`}>
            {formatDate(goal.deadline)}
          </span>
          {daysUntilDeadline && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              daysUntilDeadline <= 7 
                ? 'bg-red-500/20 text-red-400' 
                : daysUntilDeadline <= 30 
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {daysUntilDeadline} días restantes
            </span>
          )}
        </div>
      )}

      {/* Add Progress */}
      <div className="border-t border-slate-700 pt-4">
        {!isAddingProgress ? (
          <button
            onClick={() => setIsAddingProgress(true)}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar progreso</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nuevo valor ({goal.unit})
              </label>
              <input
                type="number"
                value={newProgressValue}
                onChange={(e) => setNewProgressValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder={`Ingresa el nuevo valor en ${goal.unit}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={newProgressNotes}
                onChange={(e) => setNewProgressNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="¿Qué lograste? ¿Qué obstáculos encontraste?"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddProgress}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsAddingProgress(false);
                  setNewProgressValue('');
                  setNewProgressNotes('');
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress History */}
      {goal.progressHistory.length > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-lg font-medium text-white mb-3">Historial de progreso</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {goal.progressHistory
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">
                        {entry.value.toLocaleString()} {goal.unit}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDate(entry.date)}
                      </div>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-400 max-w-xs truncate">
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalProgressTracker;
