
import React from 'react';
import { useChecklist } from '@/contexts/ChecklistContext';
import SectionScores from './SectionScores';

const ChecklistScoresHandler: React.FC = () => {
  const { auditoriaId, pageState } = useChecklist();
  
  // Obtain setPontuacaoPorSecao from context
  const setPontuacaoPorSecao = React.useContext(React.createContext<React.Dispatch<React.SetStateAction<Record<string, number>>> | undefined>(undefined));
  
  return (
    <SectionScores 
      auditoriaId={auditoriaId}
      secoes={pageState.secoes}
      respostasExistentes={pageState.respostasExistentes}
      setPontuacaoPorSecao={setPontuacaoPorSecao || (() => {})}
    />
  );
};

export default ChecklistScoresHandler;
