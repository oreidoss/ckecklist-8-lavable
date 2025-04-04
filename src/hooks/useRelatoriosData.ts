
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

export function useRelatoriosData() {
  const [lojaFiltro, setLojaFiltro] = useState<string>('');
  const [dadosGrafico, setDadosGrafico] = useState<{ nome: string; pontuacao: number }[]>([]);
  
  const { data: auditorias, isLoading: isLoadingAuditorias } = useQuery({
    queryKey: ['auditorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*), respostas(*)')
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as Auditoria[];
    }
  });
  
  const { data: lojas } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .order('numero');
      
      if (error) throw error;
      return data as Loja[];
    }
  });
  
  // Preparar dados para o gráfico
  useEffect(() => {
    if (!auditorias || !lojas) return;
    
    const dadosParaGrafico = lojas.map(loja => {
      const auditoriasLoja = auditorias.filter(a => a.loja_id === loja.id);
      const mediaPontuacao = auditoriasLoja.length > 0
        ? auditoriasLoja.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0) / auditoriasLoja.length
        : 0;
      
      return {
        nome: `${loja.numero} - ${loja.nome}`,
        pontuacao: parseFloat(mediaPontuacao.toFixed(1))
      };
    }).sort((a, b) => b.pontuacao - a.pontuacao); // Sort by score descending
    
    setDadosGrafico(dadosParaGrafico);
  }, [auditorias, lojas]);
  
  // Filtra auditorias por loja selecionada
  const auditoriasFiltradas = lojaFiltro && auditorias
    ? auditorias.filter(auditoria => lojaFiltro === 'todas-lojas' ? true : auditoria.loja_id === lojaFiltro)
    : auditorias;
  
  // Função para calcular estatísticas globais
  const calcularEstatisticas = () => {
    if (!auditorias) return { total: 0, lojasAuditadas: 0, aprovadas: 0, melhorias: 0, criticas: 0, media: 0 };
    
    // Contagem de lojas exclusivas que foram auditadas
    const lojasAuditadas = new Set(auditorias.map(a => a.loja_id)).size;
    
    // Análise das auditorias com base na pontuação
    // Consideramos a auditoria mais recente de cada loja para categorização
    const lojasUnicas = [...new Set(auditorias.map(a => a.loja_id))];
    
    let aprovadas = 0;
    let melhorias = 0;
    let criticas = 0;
    
    // Para cada loja, pegar a auditoria mais recente
    lojasUnicas.forEach(lojaId => {
      const auditoriasLoja = auditorias.filter(a => a.loja_id === lojaId);
      if (auditoriasLoja.length === 0) return;
      
      // Ordenar por data, mais recente primeiro
      auditoriasLoja.sort((a, b) => 
        new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
      );
      
      const auditoriaRecente = auditoriasLoja[0];
      
      // Categorizar com base na pontuação mais recente
      if (auditoriaRecente.pontuacao_total && auditoriaRecente.pontuacao_total > 5) {
        aprovadas++;
      } else if (auditoriaRecente.pontuacao_total && auditoriaRecente.pontuacao_total > 0) {
        melhorias++;
      } else {
        criticas++;
      }
    });
    
    // Cálculo da média geral de pontuação
    let mediaPontuacao = 0;
    if (auditorias.length > 0) {
      const somaPontuacoes = auditorias.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0);
      mediaPontuacao = somaPontuacoes / auditorias.length;
    }
    
    return {
      total: auditorias.length,
      lojasAuditadas,
      aprovadas,
      melhorias,
      criticas,
      media: parseFloat(mediaPontuacao.toFixed(1))
    };
  };
  
  const estatisticas = calcularEstatisticas();

  return {
    lojaFiltro,
    setLojaFiltro,
    dadosGrafico,
    auditorias,
    auditoriasFiltradas,
    isLoadingAuditorias,
    lojas,
    estatisticas
  };
}
