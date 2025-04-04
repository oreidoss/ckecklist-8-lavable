
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RelatorioDetalhado from '@/components/relatorio/RelatorioDetalhado';
import { HistoricoLoja } from '@/components/relatorio/HistoricoLoja';

const Relatorio: React.FC = () => {
  const { auditoriaId, lojaId } = useParams();
  const navigate = useNavigate();
  
  // Fetch specific audit data if we have an auditoriaId
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
      return data;
    },
    enabled: !!auditoriaId
  });

  // Fetch store audits if we have a lojaId
  const {
    data: auditoriasPorLoja,
    isLoading: loadingAuditoriasPorLoja
  } = useQuery({
    queryKey: ['auditorias-por-loja', lojaId],
    queryFn: async () => {
      if (!lojaId) return null;
      
      const { data: loja, error: lojaError } = await supabase
        .from('lojas')
        .select('*')
        .eq('id', lojaId)
        .single();
      
      if (lojaError) throw lojaError;
      
      const { data: auditorias, error: auditoriasError } = await supabase
        .from('auditorias')
        .select('*, usuario:usuarios(*), respostas(*)')
        .eq('loja_id', lojaId)
        .order('data', { ascending: false });
      
      if (auditoriasError) throw auditoriasError;
      
      return { loja, auditorias };
    },
    enabled: !!lojaId && !auditoriaId
  });

  // Fetch section data for categorizing questions
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

  // Fetch questions data for displaying question text
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

  if (loadingAuditoria || loadingAuditoriasPorLoja) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }

  if ((!auditoria && !auditoriasPorLoja) || (lojaId && !auditoriasPorLoja?.loja)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Relatório não encontrado</h2>
        <p className="mb-6">O relatório ou loja solicitado não foi encontrado no sistema.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Voltar
        </button>
      </div>
    );
  }

  // Report for a specific audit
  if (auditoria && secoes && perguntas) {
    // Get all audits for this store to show historical data
    const { data: auditorias = [] } = useQuery({
      queryKey: ['auditorias-loja', auditoria.loja_id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('auditorias')
          .select('*, respostas(*)')
          .eq('loja_id', auditoria.loja_id)
          .order('data', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      initialData: [],
    });

    // Convert response types to match our TypeScript definitions
    const typedRespostas = auditoria.respostas ? 
      auditoria.respostas.map(r => ({
        ...r,
        // Ensure types match our Resposta interface
        id: r.id.toString(),
        auditoria_id: r.auditoria_id?.toString() || '',
        pergunta_id: r.pergunta_id?.toString() || '',
        resposta: r.resposta || '',
        pontuacao_obtida: Number(r.pontuacao_obtida || 0),
        observacao: r.observacao || ''  // Add observacao property with default value
      })) : [];

    return (
      <RelatorioDetalhado 
        auditoria={auditoria} 
        loja={auditoria.loja} 
        respostas={typedRespostas} 
        perguntas={perguntas} 
        secoes={secoes}
        auditorias={auditorias}
      />
    );
  }
  
  // Report for a store (showing history of audits)
  if (auditoriasPorLoja && perguntas) {
    return (
      <HistoricoLoja 
        auditoriasPorLoja={auditoriasPorLoja}
        perguntas={perguntas}
      />
    );
  }

  return null;
};

export default Relatorio;
