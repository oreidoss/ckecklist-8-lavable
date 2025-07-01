
import { useMemo } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

interface UseCompletionPercentageProps {
  secoes: Secao[] | undefined;
  perguntas: Pergunta[] | undefined;
  respostas: Record<string, RespostaValor>;
  respostasExistentes?: any[];
}

export const useCompletionPercentage = ({
  secoes,
  perguntas,
  respostas,
  respostasExistentes
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
        
        // Verifica se há uma resposta válida nas respostas existentes também
        const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === p.id);
        
        // Considera válida se há resposta no estado atual OU se há resposta existente salva
        const hasValidAnswer = (resposta !== null && resposta !== undefined) || 
                              (respostaExistente && respostaExistente.resposta);
        
        console.log(`  Pergunta ${p.id}: resposta atual = "${resposta}", resposta existente = "${respostaExistente?.resposta}", válida = ${hasValidAnswer}`);
        return hasValidAnswer;
      }).length;
      
      const percentage = Math.round((answeredCount / requiredPerguntas.length) * 100);
      console.log(`- Respostas válidas: ${answeredCount}/${requiredPerguntas.length} = ${percentage}%`);
      percentages[secao.id] = percentage;
    });
    
    console.log("Porcentagens finais:", percentages);
    return percentages;
  }, [secoes, perguntas, respostas, respostasExistentes]);
  
  return { completionPercentages };
};
