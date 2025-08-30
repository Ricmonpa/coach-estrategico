import React from 'react';
import { TrendingUp, Target, Bell, RefreshCw } from 'lucide-react';
import type { Goal, ViewType } from '../types/index';

interface CoachDashboardProps {
  goals: Goal[];
  onViewChange: (view: ViewType) => void;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ goals, onViewChange }) => {

  const getGoalsSummary = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.current >= g.target).length;
    const inProgress = total - completed;
    const urgent = goals.filter(g => {
      if (!g.deadline) return false;
      const daysUntilDeadline = Math.ceil((g.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7 && g.current < g.target;
    }).length;

    return { total, completed, inProgress, urgent };
  };

  const getMainFocusGoals = () => {
    // Get goals that are in progress and have the highest priority (closest to deadline or highest progress)
    return goals
      .filter(g => g.current < g.target)
      .sort((a, b) => {
        // Sort by progress percentage, then by deadline proximity
        const aProgress = (a.current / a.target) * 100;
        const bProgress = (b.current / b.target) * 100;
        
        if (Math.abs(aProgress - bProgress) > 10) {
          return bProgress - aProgress; // Higher progress first
        }
        
        // If progress is similar, sort by deadline
        if (a.deadline && b.deadline) {
          return a.deadline.getTime() - b.deadline.getTime();
        }
        
        return 0;
      })
      .slice(0, 3); // Top 3 goals
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const summary = getGoalsSummary();
  const mainFocusGoals = getMainFocusGoals();

  // Calculate donut chart data
  const totalGoals = summary.total;
  const completedGoals = summary.completed;
  const inProgressGoals = summary.inProgress;
  
  // Calculate angles for the donut chart segments
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dasharray and offset for each segment
  const completedAngle = totalGoals > 0 ? (completedGoals / totalGoals) * 360 : 0;
  const inProgressAngle = totalGoals > 0 ? (inProgressGoals / totalGoals) * 360 : 0;
  
  // Convert angles to stroke dasharray values
  const completedDashArray = (completedAngle / 360) * circumference;
  const inProgressDashArray = (inProgressAngle / 360) * circumference;
  
  // Calculate stroke dashoffset to position segments correctly
  const completedDashOffset = circumference - completedDashArray;
  const inProgressDashOffset = circumference - completedDashArray - inProgressDashArray;
  
  // Debug: Log the calculations
  console.log('Donut Chart Debug:', {
    totalGoals,
    completedGoals,
    inProgressGoals,
    completedAngle: `${completedAngle.toFixed(1)}°`,
    inProgressAngle: `${inProgressAngle.toFixed(1)}°`,
    completedDashArray: `${completedDashArray.toFixed(1)}`,
    inProgressDashArray: `${inProgressDashArray.toFixed(1)}`,
    completedDashOffset: `${completedDashOffset.toFixed(1)}`,
    inProgressDashOffset: `${inProgressDashOffset.toFixed(1)}`,
    circumference: `${circumference.toFixed(1)}`
  });

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-slate-900 dashboard-container">
      <div className="max-w-4xl mx-auto" style={{ marginTop: '120px' }}>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Dashboard de Mando</h1>
          <p className="text-gray-400 text-lg">Resumen del campo de batalla estratégico.</p>
        </div>

        {/* Main Donut Chart */}
        <div className="dashboard-card">
          <div className="flex justify-center">
            <div className="relative">
              {/* Donut Chart */}
              <svg width="200" height="200" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#475569"
                  strokeWidth="16"
                  fill="transparent"
                />
                
                {/* Completed segment (green) - starts from top */}
                {completedGoals > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#10B981"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${completedDashArray} ${circumference - completedDashArray}`}
                    strokeDashoffset={completedDashOffset}
                    strokeLinecap="round"
                  />
                )}
                
                {/* In Progress segment (blue) - starts after completed */}
                {inProgressGoals > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#3B82F6"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${inProgressDashArray} ${circumference - inProgressDashArray}`}
                    strokeDashoffset={inProgressDashOffset}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                </div>
              </div>
              
              {/* Always visible tooltips */}
              {completedGoals > 0 && (
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full pointer-events-none">
                  <div className="bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm whitespace-nowrap mr-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                      <span>Completadas</span>
                    </div>
                    <div className="text-center mt-1 font-bold">
                      {completedGoals}
                    </div>
                  </div>
                </div>
              )}
              
              {inProgressGoals > 0 && (
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full pointer-events-none">
                  <div className="bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm whitespace-nowrap" style={{ marginLeft: '3rem' }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                      <span>En Progreso</span>
                    </div>
                    <div className="text-center mt-1 font-bold">
                      {inProgressGoals}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Main Focus Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">Foco Principal</h2>
          <div className="space-y-6">
            {mainFocusGoals.map(goal => {
              const progress = (goal.current / goal.target) * 100;
              const circumference = 2 * Math.PI * 20; // radius = 20
              const strokeDashoffset = circumference - (progress / 100) * circumference;
              
              return (
                <div key={goal.id} className="dashboard-card focus-card">
                  <div className="flex items-center justify-between">
                    {/* Progress Circle */}
                    <div className="relative">
                      <svg width="50" height="50" className="transform -rotate-90">
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-slate-700"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-blue-500"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
                      </div>
                    </div>
                    
                    {/* Goal Info */}
                    <div className="flex-1 ml-8">
                      <h3 className="text-lg font-semibold text-white mb-2">{goal.title}</h3>
                      <p className="text-gray-400">
                        {goal.unit === '$' ? formatCurrency(goal.current) : goal.current.toLocaleString()} / {goal.unit === '$' ? formatCurrency(goal.target) : goal.target.toLocaleString()} {goal.unit}
                      </p>
                    </div>
                    
                    {/* Update Button */}
                    <button
                      onClick={() => onViewChange('metas')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Actualizar</span>
                    </button>
                  </div>
                </div>
              );
            })}
            
            {mainFocusGoals.length === 0 && (
              <div className="dashboard-card focus-card text-center">
                <p className="text-gray-400">No hay metas activas para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h3 className="text-xl font-semibold text-white mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => onViewChange('metas')}
              className="flex items-center justify-center space-x-3 p-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200"
            >
              <Target className="w-6 h-6 text-blue-400" />
              <span className="text-white font-medium">Ver Todas las Metas</span>
            </button>
            
            <button
              onClick={() => onViewChange('coach')}
              className="flex items-center justify-center space-x-3 p-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-all duration-200"
            >
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Hablar con el Coach</span>
            </button>
            
            <button
              onClick={() => {
                // Aquí podrías abrir el panel de notificaciones
                console.log('Abrir notificaciones');
              }}
              className="flex items-center justify-center space-x-3 p-6 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg transition-all duration-200"
            >
              <Bell className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-medium">
                Notificaciones
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
