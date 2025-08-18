import { useState } from 'react';
import type { ViewType, Goal } from './types/index';
import { initialGoals, resources } from './data/initialData';
import CoachChat from './components/CoachChat';
import GoalsView from './components/GoalsView';
import ResourcesView from './components/ResourcesView';
import ProfileView from './components/ProfileView';
import Navigation from './components/Navigation';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('coach');
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now()
    };
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoal = (goalId: number, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const handleSaveProfile = (data: { mission: string; values: string }) => {
    // TODO: Implement profile saving
    console.log('Profile saved:', data);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'coach':
        return (
          <CoachChat
            resources={resources}
            onResourceClick={() => {}}
            onGoalSuggestion={(suggestedGoal) => {
              const newGoal: Goal = {
                id: Date.now(),
                title: suggestedGoal.title,
                metric: suggestedGoal.metric,
                current: 0,
                target: suggestedGoal.target,
                unit: suggestedGoal.unit,
                status: 'En Progreso'
              };
              setGoals(prev => [...prev, newGoal]);
              setCurrentView('metas'); // Cambiar a la vista de metas para ver la nueva meta
            }}
          />
        );
      case 'metas':
        return (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        );
      case 'recursos':
        return (
          <ResourcesView
            resources={resources}
          />
        );
      case 'perfil':
        return (
          <ProfileView
            onSaveProfile={handleSaveProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex md:justify-center md:items-start" style={{ minHeight: '100vh' }}>
      <div className="w-full bg-slate-900 flex flex-col desktop-compact" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Header - Fixed at top */}
        <header className="flex items-center p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10" style={{ height: '60px', minHeight: '60px', overflow: 'visible' }}>
          <div className="flex items-center pl-6">
            <h1 className="text-white text-2xl font-bold">Brutalytics</h1>
          </div>

        </header>
        
        {/* Content area - Takes remaining space between header and bottom nav */}
        <div className="overflow-hidden content-area" style={{ height: 'calc(100vh - 60px - 80px)', flex: '1', overflow: 'hidden', position: 'relative', zIndex: '1', backgroundColor: 'transparent', minHeight: '200px' }}>
          {renderCurrentView()}
        </div>

        {/* Bottom Navigation - Fixed at bottom */}
        <Navigation 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>
    </div>
  );
}

export default App;
