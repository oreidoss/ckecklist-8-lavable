
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SectionWarning: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded p-2 mb-2 flex items-center gap-2 text-amber-700 text-xs">
      <AlertTriangle className="h-4 w-4" />
      Todas as perguntas são obrigatórias, exceto observações e anexos.
    </div>
  );
};

export default SectionWarning;
