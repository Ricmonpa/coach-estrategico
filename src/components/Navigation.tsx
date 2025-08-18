import { Shield, Target, BookOpen, User } from 'lucide-react';
import type { ViewType } from '../types/index';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'coach' as ViewType, icon: Shield, label: 'Coach' },
    { id: 'metas' as ViewType, icon: Target, label: 'Metas' },
    { id: 'recursos' as ViewType, icon: BookOpen, label: 'Recursos' },
    { id: 'perfil' as ViewType, icon: User, label: 'Perfil' }
  ];

  return (
    <nav className="bg-slate-800 flex justify-around py-2 fixed bottom-0 left-0 right-0 z-50">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`flex flex-col items-center w-1/4 transition-colors ${
            currentView === id ? 'nav-active' : 'nav-inactive hover:text-white'
          }`}
        >
          <div className="py-2">
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 block">{label}</span>
          </div>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
