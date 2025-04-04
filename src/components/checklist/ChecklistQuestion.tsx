
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
  
  // Função para determinar o estilo baseado na resposta
  const getButtonStyle = (valor: RespostaValor): string => {
    if (resposta !== valor) return '';
    
    switch (valor) {
      case 'Sim':
        return 'bg-green-500 text-white border-green-500 hover:bg-green-600';
      case 'Não':
        return 'bg-red-500 text-white border-red-500 hover:bg-red-600';
      case 'Regular':
        return 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600';
      case 'N/A':
        return 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600';
      default:
        return '';
    }
  };
  
  return (
    <div className="border rounded-lg p-1 w-full">
      <h3 className="text-xs font-medium mb-1 line-clamp-2">{pergunta.texto}</h3>
      
      <div className="grid grid-cols-4 gap-1">
        {(['Sim', 'Não', 'Regular', 'N/A'] as RespostaValor[]).map((valor) => (
          <Button
            key={valor}
            variant={resposta === valor ? "default" : "outline"}
            size="sm"
            className={`text-[10px] p-1 ${getButtonStyle(valor)}`}
            onClick={() => handleResposta(pergunta.id, valor)}
          >
            {valor}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChecklistQuestion;
