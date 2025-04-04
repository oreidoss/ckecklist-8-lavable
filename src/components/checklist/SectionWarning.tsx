
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SectionWarningProps {
  isNavigating?: boolean;
}

const SectionWarning: React.FC<SectionWarningProps> = ({ isNavigating }) => {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded p-2 mb-2 flex items-center gap-2 text-amber-700 text-xs">
      <AlertTriangle className="h-4 w-4" />
      {isNavigating 
        ? "Existem perguntas não respondidas nesta seção. Você ainda pode navegar, mas a seção não será salva como completa."
        : "Todas as perguntas são obrigatórias, exceto observações e anexos."}
    </div>
  );
};

export default SectionWarning;
