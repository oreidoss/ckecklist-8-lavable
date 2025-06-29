
import { useMemo } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

interface UseCompletionPercentageProps {
  secoes: Secao[] | undefined;
  perguntas: Pergunta[] | undefined;
  respostas: Record<string, RespostaValor>;
}

export const useCompletionPercentage = ({
  secoes,
  perguntas,
  respostas
}: UseCompletionPercentageProps) => {
  const completionPercentages = useMemo(() => {
    if (!secoes || !perguntas) return {};
    
    const percentages: Record<string, number> = {};
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      // Consideramos apenas perguntas obrigatórias (excluindo as duas últimas que são observações e anexos)
      const requiredPerguntas = secaoPerguntas.slice(0, -2);
      
      if (requiredPerguntas.length === 0) {
        percentages[secao.id] = 0;
        return;
      }
      
      const answeredCount = requiredPerguntas.filter(p => {
        const resposta = respostas[p.id];
        // Verifica se há uma resposta válida (qualquer string não nula)
        const hasValidAnswer = resposta !== null && resposta !== undefined && resposta !== '';
        console.log(`Pergunta ${p.id}: resposta = "${resposta}", válida = ${hasValidAnswer}`);
        return hasValidAnswer;
      }).length;
      
      const percentage = Math.round((answeredCount / requiredPerguntas.length) * 100);
      console.log(`Seção ${secao.nome}: ${answeredCount}/${requiredPerguntas.length} = ${percentage}%`);
      percentages[secao.id] = percentage;
    });
    
    return percentages;
  }, [secoes, perguntas, respostas]);
  
  return { completionPercentages };
};
