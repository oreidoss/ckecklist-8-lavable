
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

export const useChecklist = (auditoriaId: string | undefined, perguntas: Pergunta[] | undefined) => {
  const { toast } = useToast();
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState<number>(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const pontuacaoMap: Record<RespostaValor, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[]) => {
    if (!auditoriaId) return;
    
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: resposta
    }));
    
    const pontuacao = pontuacaoMap[resposta];
    const observacao = observacoes[perguntaId] || '';
    const anexo_url = fileUrls[perguntaId] || '';
    
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          })
          .eq('id', respostaExistente.id);
        
        if (error) {
          console.error("Erro ao atualizar resposta:", error);
          toast({
            title: "Erro ao atualizar resposta",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('respostas')
          .insert({
            auditoria_id: auditoriaId,
            pergunta_id: perguntaId,
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          });
        
        if (error) {
          console.error("Erro ao salvar resposta:", error);
          toast({
            title: "Erro ao salvar resposta",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
      }
      
      if (perguntas?.length) {
        const novasRespostas = {
          ...respostas,
          [perguntaId]: resposta
        };
        
        const novasRespostasCount = Object.keys(novasRespostas).length;
        const progresso = (novasRespostasCount / perguntas.length) * 100;
        setProgresso(progresso);
      }
      
      if (auditoriaId) {
        let pontuacaoTotal = 0;
        
        respostasExistentes?.forEach(r => {
          if (r.pergunta_id !== perguntaId) {
            pontuacaoTotal += r.pontuacao_obtida || 0;
          }
        });
        
        pontuacaoTotal += pontuacao;
        
        await supabase
          .from('auditorias')
          .update({ 
            pontuacao_total: pontuacaoTotal,
          })
          .eq('id', auditoriaId);
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a resposta.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (perguntaId: string, file: File, respostasExistentes: any[]) => {
    if (!auditoriaId || !file) return;
    
    setUploading(prev => ({ ...prev, [perguntaId]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${auditoriaId}/${perguntaId}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('auditoria-anexos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('auditoria-anexos')
        .getPublicUrl(filePath);
      
      setFileUrls(prev => ({ 
        ...prev, 
        [perguntaId]: publicUrl 
      }));
      
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            anexo_url: publicUrl
          })
          .eq('id', respostaExistente.id);
        
        if (error) throw error;
        
        toast({
          title: "Arquivo enviado",
          description: "O arquivo foi enviado com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [perguntaId]: false }));
    }
  };

  const handleObservacaoChange = (perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  };

  const handleSaveObservacao = async (perguntaId: string, respostasExistentes: any[]) => {
    if (!auditoriaId) return;
    
    const observacao = observacoes[perguntaId] || '';
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            observacao: observacao
          })
          .eq('id', respostaExistente.id);
        
        if (error) throw error;
        
        toast({
          title: "Observação salva",
          description: "A observação foi salva com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a observação.",
        variant: "destructive"
      });
    }
  };

  const saveAndNavigateHome = async (respostasExistentes: any[]) => {
    if (isSaving || !auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as respostas.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCompletedSections = (activeSecao: string | null, secoes: any[], perguntas: Pergunta[]) => {
    if (activeSecao && perguntas) {
      const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
      const todasRespondidasSecaoAtiva = perguntasSecaoAtiva.every(p => 
        respostas[p.id] !== undefined
      );
      
      if (todasRespondidasSecaoAtiva && !completedSections.includes(activeSecao)) {
        setCompletedSections(prev => [...prev, activeSecao]);
      }
    }
  };

  return {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    setObservacoes,
    uploading,
    setUploading,
    fileUrls,
    setFileUrls,
    isSaving,
    setIsSaving,
    handleResposta,
    handleFileUpload,
    handleObservacaoChange,
    handleSaveObservacao,
    saveAndNavigateHome,
    updateCompletedSections
  };
};
