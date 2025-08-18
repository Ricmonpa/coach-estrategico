import { useState } from 'react';
import { Filter, TrendingUp, Box, Target, X } from 'lucide-react';
import type { Resource } from '../types/index';

interface ResourcesViewProps {
  resources: Resource[];
}

const ResourcesView = ({ resources }: ResourcesViewProps) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'filter':
        return <Filter className="w-6 h-6" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6" />;
      case 'box':
        return <Box className="w-6 h-6" />;
      case 'target':
        return <Target className="w-6 h-6" />;
      default:
        return <Box className="w-6 h-6" />;
    }
  };

  const renderResourceCard = (resource: Resource) => (
    <div
      key={resource.id}
      onClick={() => setSelectedResource(resource)}
      className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/30 hover:bg-gray-700/40 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors duration-300">
          {getIconComponent(resource.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {resource.subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          Arsenal de Estrategias
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          Modelos mentales para tomar decisiones de alta calidad.
        </p>
      </div>
      
      <div className="space-y-5">
        {resources.map(renderResourceCard)}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in border border-gray-700/50">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedResource.title}</h2>
                <p className="text-gray-300 text-lg">{selectedResource.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-gray-200 space-y-4 leading-relaxed text-base">
              {selectedResource.description.split('.').map((sentence, index) => (
                sentence.trim() && (
                  <p key={index} className="text-gray-200">
                    {sentence.trim()}.
                  </p>
                )
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-8 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesView;
