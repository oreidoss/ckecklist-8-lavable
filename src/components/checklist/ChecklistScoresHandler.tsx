import React from 'react';
import { useChecklist } from '@/contexts/ChecklistContext';
import SectionScores from './SectionScores';

const ChecklistScoresHandler: React.FC = () => {
  const { auditoriaId, pageState } = useChecklist();
  
  return (
    <SectionScores 
      auditoriaId={auditoriaId}
      secoes={pageState.secoes}
      respostasExistentes={pageState.respostasExistentes}
    />
  );
};

export default ChecklistScoresHandler;
