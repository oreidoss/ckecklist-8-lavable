
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
    if (!secoes || !perguntas) {
      console.log("useCompletionPercentage: Sem seções ou perguntas");
      return {};
    }
    
    console.log("useCompletionPercentage: Iniciando cálculo");
    console.log("Respostas recebidas:", respostas);
    console.log("Total de respostas:", Object.keys(respostas).length);
    
    const percentages: Record<string, number> = {};
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      // Consideramos apenas perguntas obrigatórias (excluindo as duas últimas que são observações e anexos)
      const requiredPerguntas = secaoPerguntas.slice(0, -2);
      
      console.log(`Seção ${secao.nome}:`);
      console.log(`- Total perguntas: ${secaoPerguntas.length}`);
      console.log(`- Perguntas obrigatórias: ${requiredPerguntas.length}`);
      
      if (requiredPerguntas.length === 0) {
        percentages[secao.id] = 0;
        console.log(`- Sem perguntas obrigatórias, porcentagem: 0%`);
        return;
      }
      
      const answeredCount = requiredPerguntas.filter(p => {
        const resposta = respostas[p.id];
        // Verifica se há uma resposta válida - inclui todos os tipos de resposta possíveis
        const hasValidAnswer = resposta !== null && 
                              resposta !== undefined && 
                              resposta !== '' &&
                              resposta !== 'null' &&
                              String(resposta).trim() !== '';
        
        console.log(`  Pergunta ${p.id}: resposta = "${resposta}" (tipo: ${typeof resposta}), válida = ${hasValidAnswer}`);
        return hasValidAnswer;
      }).length;
      
      const percentage = Math.round((answeredCount / requiredPerguntas.length) * 100);
      console.log(`- Respostas válidas: ${answeredCount}/${requiredPerguntas.length} = ${percentage}%`);
      percentages[secao.id] = percentage;
    });
    
    console.log("Porcentagens finais:", percentages);
    return percentages;
  }, [secoes, perguntas, respostas]);
  
  return { completionPercentages };
};
