
import { useState, useCallback } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useToast } from '@/hooks/use-toast';

interface UseSectionNavigationProps {
  secoes: Secao[] | undefined;
  perguntas: Pergunta[] | undefined;
  respostas: Record<string, RespostaValor>;
}

export const useSectionNavigation = ({
  secoes,
  perguntas,
  respostas
}: UseSectionNavigationProps) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);
  const { toast } = useToast();

  const getPerguntasBySecao = useCallback((secaoId: string) => {
    return perguntas?.filter(pergunta => pergunta.secao_id === secaoId) || [];
  }, [perguntas]);

  const updateIncompleteSections = useCallback(() => {
    if (!secoes || !perguntas) return;
    
    const incomplete: string[] = [];
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      // Consideramos apenas as perguntas obrigatórias (exceto as duas últimas, que são para observações e anexos)
      const requiredPerguntas = secaoPerguntas.slice(0, -2);
      
      if (requiredPerguntas.length > 0 && 
          requiredPerguntas.some(p => !respostas[p.id])) {
        incomplete.push(secao.id);
      }
    });
    
    setIncompleteSections(incomplete);
  }, [secoes, perguntas, respostas]);

  const goToNextSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      setActiveSecao(secoes[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao]);
  
  const goToPreviousSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex > 0) {
      setActiveSecao(secoes[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao]);
  
  const handleSetActiveSecao = useCallback((secaoId: string) => {
    // Se não tiver seção ativa ou estiver na mesma seção, simplesmente ativa
    if (!activeSecao || secaoId === activeSecao) {
      setActiveSecao(secaoId);
      return;
    }
    
    // Verifica se há perguntas não respondidas na seção atual
    const perguntasAtivas = getPerguntasBySecao(activeSecao);
    // Consideramos apenas perguntas obrigatórias (exceto as duas últimas, que são observações e anexos)
    const requiredPerguntas = perguntasAtivas.slice(0, -2);
    const hasUnanswered = requiredPerguntas.some(p => !respostas[p.id]);
    
    // Se houver perguntas não respondidas, mostra alerta
    if (hasUnanswered) {
      toast({
        title: "Perguntas não respondidas",
        description: "Por favor, responda todas as perguntas obrigatórias antes de mudar de seção.",
        variant: "destructive"
      });
      // Apesar do aviso, permitimos a navegação
      setActiveSecao(secaoId);
      window.scrollTo(0, 0);
      return;
    }
    
    // Se todas as perguntas foram respondidas, muda de seção
    setActiveSecao(secaoId);
    window.scrollTo(0, 0);
  }, [activeSecao, getPerguntasBySecao, respostas, toast]);

  return {
    activeSecao,
    setActiveSecao,
    incompleteSections,
    setIncompleteSections,
    getPerguntasBySecao,
    updateIncompleteSections,
    goToNextSection,
    goToPreviousSection,
    handleSetActiveSecao
  };
};
