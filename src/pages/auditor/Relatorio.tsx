
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RelatorioDetalhado from '@/components/relatorio/RelatorioDetalhado';
import { HistoricoLoja } from '@/components/relatorio/HistoricoLoja';
import { Auditoria } from '@/lib/types'; // Import the Auditoria type

const Relatorio: React.FC = () => {
  const { auditoriaId, lojaId } = useParams();
  const navigate = useNavigate();
  
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

  if (auditoria && secoes && perguntas) {
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

    const typedRespostas = auditoria.respostas ? 
      auditoria.respostas.map(r => ({
        ...r,
        id: r.id.toString(),
        auditoria_id: r.auditoria_id?.toString() || '',
        pergunta_id: r.pergunta_id?.toString() || '',
        resposta: r.resposta || '',
        pontuacao_obtida: Number(r.pontuacao_obtida || 0),
        observacao: r.observacao || undefined
      })) : [];

    const typedAuditoria = {
      ...auditoria,
      id: auditoria.id.toString(),
      loja_id: auditoria.loja_id.toString(),
      usuario_id: auditoria.usuario_id.toString(),
      status: auditoria.status || 'em_andamento',
      pontuacao_total: Number(auditoria.pontuacao_total || 0)
    } as Auditoria;

    const typedAuditorias = auditorias.map(a => ({
      ...a,
      id: a.id.toString(),
      loja_id: a.loja_id.toString(),
      usuario_id: a.usuario_id?.toString() || '',
      status: a.status || 'em_andamento',
      pontuacao_total: Number(a.pontuacao_total || 0)
    })) as Auditoria[];

    return (
      <RelatorioDetalhado 
        auditoria={typedAuditoria} 
        loja={auditoria.loja} 
        respostas={typedRespostas} 
        perguntas={perguntas} 
        secoes={secoes}
        auditorias={typedAuditorias}
      />
    );
  }

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
