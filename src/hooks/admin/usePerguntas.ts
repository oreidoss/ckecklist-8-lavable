
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pergunta, Secao } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function usePerguntas() {
  const { toast } = useToast();
  const [perguntaParaEditar, setPerguntaParaEditar] = useState<Pergunta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch perguntas
  const { 
    data: perguntas = [], 
    isLoading: isLoadingPerguntas,
    refetch: refetchPerguntas
  } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*');
      
      if (error) {
        console.error("Erro ao carregar perguntas:", error);
        toast({
          title: "Erro ao carregar perguntas",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Pergunta[];
    }
  });
  
  // Fetch secoes
  const {
    data: secoes = [],
    isLoading: isLoadingSecoes
  } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*');
      
      if (error) {
        console.error("Erro ao carregar seções:", error);
        toast({
          title: "Erro ao carregar seções",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Secao[];
    }
  });
  
  const handleAtualizarPergunta = async (pergunta: Pergunta) => {
    if (!pergunta.secao_id || !pergunta.texto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a seção e o texto da pergunta.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('perguntas')
        .update({
          secao_id: pergunta.secao_id,
          texto: pergunta.texto
        })
        .eq('id', pergunta.id);
      
      if (error) throw error;
      
      await refetchPerguntas();
      setPerguntaParaEditar(null);
      
      toast({
        title: "Pergunta atualizada",
        description: "A pergunta foi atualizada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar pergunta:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a pergunta.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExcluirPergunta = async (id: string) => {
    try {
      setIsSubmitting(true);
      // Verificar se há respostas associadas a esta pergunta
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas')
        .select('id')
        .eq('pergunta_id', id)
        .limit(1);
      
      if (respostasError) throw respostasError;
      
      if (respostas && respostas.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Esta pergunta possui respostas associadas em auditorias. Exclua as auditorias primeiro.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('perguntas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await refetchPerguntas();
      
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi excluída com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir pergunta:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a pergunta.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    perguntas,
    secoes,
    isLoadingPerguntas,
    isLoadingSecoes,
    isLoading: isLoadingPerguntas || isLoadingSecoes,
    isSubmitting,
    perguntaParaEditar,
    setPerguntaParaEditar,
    refetchPerguntas,
    handleAtualizarPergunta,
    handleExcluirPergunta
  };
}
