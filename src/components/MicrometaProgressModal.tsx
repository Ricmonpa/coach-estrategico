import { useState } from 'react';
import { X, Link, FileText } from 'lucide-react';
import type { Micrometa, MicrometaProgressData } from '../types/index';

interface MicrometaProgressModalProps {
  micrometa: Micrometa;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MicrometaProgressData) => void;
}

const MicrometaProgressModal = ({ micrometa, isOpen, onClose, onSubmit }: MicrometaProgressModalProps) => {
  const [formData, setFormData] = useState({
    newValue: micrometa.current.toString(),
    notes: '',
    evidence: '',
    links: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const progressData: MicrometaProgressData = {
        micrometaId: micrometa.id,
        newValue: parseFloat(formData.newValue),
        notes: formData.notes || undefined,
        evidence: formData.evidence || undefined,
        links: formData.links ? formData.links.split('\n').filter(link => link.trim()) : undefined
      };

      await onSubmit(progressData);
      
      // Reset form
      setFormData({
        newValue: micrometa.current.toString(),
        notes: '',
        evidence: '',
        links: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating micrometa progress:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        newValue: micrometa.current.toString(),
        notes: '',
        evidence: '',
        links: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  console.log('🎭 MicrometaProgressModal renderizando con isOpen:', isOpen, 'micrometa:', micrometa.title);

  return (
    <div className="progress-modal">
      <div className="progress-modal-content w-full max-w-lg p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3 text-blue-400">📊</span>
              Actualizar Micrometa
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">{micrometa.title}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nuevo Valor */}
          <div>
            <label htmlFor="newValue" className="block text-sm font-semibold text-gray-300 mb-2">
              Nuevo Progreso
            </label>
            <div className="relative">
              <input
                type="number"
                id="newValue"
                value={formData.newValue}
                onChange={(e) => setFormData(prev => ({ ...prev, newValue: e.target.value }))}
                className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 text-lg font-medium"
                placeholder={`Ej: ${micrometa.unit === '$' ? '1500000' : '25'}`}
                required
                min="0"
                max={micrometa.target * 2}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                {micrometa.unit}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="mr-1">🎯</span>
              Objetivo: {micrometa.unit === '$' ? '$' : ''}{micrometa.target.toLocaleString()}{micrometa.unit !== '$' ? micrometa.unit : ''}
            </p>
          </div>
          
          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Notas
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 resize-none"
              rows={3}
              placeholder="Describe qué actividad realizaste para avanzar en esta micrometa..."
              disabled={isSubmitting}
            />
          </div>
          
          {/* Evidencia */}
          <div>
            <label htmlFor="evidence" className="block text-sm font-semibold text-gray-300 mb-2">
              Evidencia
            </label>
            <textarea
              id="evidence"
              value={formData.evidence}
              onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
              className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 resize-none"
              rows={2}
              placeholder="Proporciona evidencia concreta de tu progreso..."
              disabled={isSubmitting}
            />
          </div>
          
          {/* Enlaces */}
          <div>
            <label htmlFor="links" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Enlaces (uno por línea)
            </label>
            <textarea
              id="links"
              value={formData.links}
              onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))}
              className="w-full bg-gray-700/80 border border-gray-600/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 resize-none"
              rows={2}
              placeholder="https://ejemplo.com/resultado1&#10;https://ejemplo.com/resultado2"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-gray-300 bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? 'Guardando...' : 'Actualizar Progreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MicrometaProgressModal;
