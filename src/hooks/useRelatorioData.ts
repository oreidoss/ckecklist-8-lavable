
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Auditoria, Resposta } from '@/lib/types';

export function useRelatorioData() {
  const { auditoriaId } = useParams();
  
  const { data: secoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: perguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });
  
  const { 
    data: auditoria, 
    isLoading: loadingAuditoria,
    refetch: refetchAuditoria
  } = useQuery({
    queryKey: ['auditoria', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) return null;
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*), respostas(*)')
        .eq('id', auditoriaId)
        .single();
      
      if (error) throw error;
      
      // Count total perguntas for comparison
      const { count: perguntasCount, error: countError } = await supabase
        .from('perguntas')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Add the count to the auditoria object
      return {
        ...data,
        perguntas_count: perguntasCount
      };
    },
    enabled: !!auditoriaId
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: auditorias = [] } = useQuery({
    queryKey: ['auditorias-loja', auditoria?.loja_id],
    queryFn: async () => {
      if (!auditoria?.loja_id) return [];
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, respostas(*)')
        .eq('loja_id', auditoria.loja_id)
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!auditoria?.loja_id
  });

  // Convert responses to typed data
  const processAuditoriaData = () => {
    if (!auditoria || !secoes || !perguntas) return null;

    const typedRespostas: Resposta[] = auditoria.respostas ? 
      auditoria.respostas.map(r => ({
        ...r,
        id: r.id.toString(),
        auditoria_id: r.auditoria_id?.toString() || '',
        pergunta_id: r.pergunta_id?.toString() || '',
        resposta: r.resposta || '',
        pontuacao_obtida: Number(r.pontuacao_obtida || 0),
        observacao: r.observacao || '',
        anexo_url: r.anexo_url || ''
      })) : [];

    const typedAuditoria: Auditoria = {
      ...auditoria,
      id: auditoria.id.toString(),
      loja_id: auditoria.loja_id.toString(),
      usuario_id: auditoria.usuario_id.toString(),
      status: auditoria.status || 'em_andamento',
      pontuacao_total: Number(auditoria.pontuacao_total || 0),
      perguntas_count: auditoria.perguntas_count || perguntas.length
    };

    const typedAuditorias: Auditoria[] = auditorias.map(a => ({
      ...a,
      id: a.id.toString(),
      loja_id: a.loja_id.toString(),
      usuario_id: a.usuario_id?.toString() || '',
      status: a.status || 'em_andamento',
      pontuacao_total: Number(a.pontuacao_total || 0)
    }));

    return {
      typedAuditoria,
      typedRespostas,
      typedAuditorias
    };
  };

  return {
    secoes,
    perguntas,
    auditoria,
    loadingAuditoria,
    refetchAuditoria,
    usuarios,
    auditorias,
    processedData: processAuditoriaData()
  };
}
