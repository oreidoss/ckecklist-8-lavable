
import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from './ChecklistQuestion';

interface ChecklistQuestionProps {
  pergunta: Pergunta;
  index: number;
  resposta: RespostaValor | undefined;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
}

const ChecklistQuestion: React.FC<ChecklistQuestionProps> = ({
  pergunta,
  resposta,
  handleResposta
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="border rounded-lg p-2 sm:p-3 w-full">
      <h3 className="text-sm font-medium mb-2 line-clamp-2">{pergunta.texto}</h3>
      
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${resposta === 'Sim' ? 'bg-green-500 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Sim')}
        >
          Sim
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${resposta === 'Não' ? 'bg-red-500 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Não')}
        >
          Não
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${resposta === 'Regular' ? 'bg-yellow-500 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Regular')}
        >
          Regular
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${resposta === 'N/A' ? 'bg-gray-500 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'N/A')}
        >
          N/A
        </Button>
      </div>
    </div>
  );
};

export default ChecklistQuestion;
