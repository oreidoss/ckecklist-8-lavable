
import React from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Pergunta } from '@/lib/types';

export type RespostaValor = 'Sim' | 'Não' | 'Regular' | 'N/A';

interface ChecklistQuestionProps {
  pergunta: Pergunta;
  index: number;
  resposta: RespostaValor | undefined;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
}

const ChecklistQuestion: React.FC<ChecklistQuestionProps> = ({
  pergunta,
  index,
  resposta,
  handleResposta
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="border rounded-lg p-1 w-full">
      <h3 className="text-xs font-medium mb-1 line-clamp-2">{pergunta.texto}</h3>
      
      <div className="grid grid-cols-4 gap-1">
        {['Sim', 'Não', 'Regular', 'N/A'].map((valor) => (
          <Button
            key={valor}
            variant="outline"
            size="sm"
            className={`text-[10px] p-1 ${resposta === valor ? 
              (valor === 'Sim' ? 'bg-green-500' : 
               valor === 'Não' ? 'bg-red-500' : 
               valor === 'Regular' ? 'bg-yellow-500' : 
               'bg-gray-500') + ' text-white' : ''}`}
            onClick={() => handleResposta(pergunta.id, valor as RespostaValor)}
          >
            {valor}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChecklistQuestion;
