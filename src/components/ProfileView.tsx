import { useState } from 'react';

interface ProfileViewProps {
  onSaveProfile: (data: { mission: string; values: string }) => void;
}

const ProfileView = ({ onSaveProfile }: ProfileViewProps) => {
  const [formData, setFormData] = useState({
    mission: '',
    values: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
  };

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Perfil Estratégico</h2>
          <p className="text-gray-400">Define tu sistema operativo interno.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="personalMission" className="block text-sm font-medium text-gray-300 mb-2">
              Declaración de Misión Personal
            </label>
            <textarea
              id="personalMission"
              value={formData.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="¿Cuál es tu propósito fundamental?"
            />
          </div>
          
          <div>
            <label htmlFor="coreValues" className="block text-sm font-medium text-gray-300 mb-2">
              Valores Fundamentales (separados por comas)
            </label>
            <textarea
              id="coreValues"
              value={formData.values}
              onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ej: Integridad, Audacia, Enfoque Implacable"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-colors"
            >
              Guardar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
