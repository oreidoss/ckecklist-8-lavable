
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
  
  const getButtonVariant = (valor: RespostaValor) => {
    return (resposta === valor) ? "default" : "outline";
  };

  const getButtonStyle = (valor: RespostaValor): string => {
    if (resposta !== valor) return "text-gray-700 border-gray-300";
    
    switch (valor) {
      case 'Sim':
        return 'bg-green-500 text-white border-green-500 hover:bg-green-600 font-bold';
      case 'Não':
        return 'bg-red-500 text-white border-red-500 hover:bg-red-600 font-bold';
      case 'Regular':
        return 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 font-bold';
      case 'N/A':
        return 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600 font-bold';
      default:
        return '';
    }
  };
  
  const handleClick = (valor: RespostaValor) => {
    handleResposta(pergunta.id, valor);
  };
  
  return (
    <div className="border rounded-lg p-1 w-full">
      <h3 className="text-xs font-medium mb-1 line-clamp-2">{pergunta.texto}</h3>
      
      <div className="grid grid-cols-4 gap-1">
        {(['Sim', 'Não', 'Regular', 'N/A'] as RespostaValor[]).map((valor) => (
          <Button
            key={valor}
            variant={getButtonVariant(valor)}
            size="sm"
            className={`text-[10px] p-1 transition-colors duration-200 ${getButtonStyle(valor)} ${resposta === valor ? 'ring-2 ring-offset-1 ring-opacity-50' : ''}`}
            onClick={() => handleClick(valor)}
          >
            {valor}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChecklistQuestion;
