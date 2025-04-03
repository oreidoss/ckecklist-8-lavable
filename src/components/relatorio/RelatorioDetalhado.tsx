
import React, { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTitle } from '@/components/PageTitle';
import { InformacoesGerais } from './InformacoesGerais';
import { PontuacaoPorSecao } from './PontuacaoPorSecao';
import { PontosAtencao } from './PontosAtencao';
import { AnaliseGeral } from './AnaliseGeral';
import { RelatorioActions } from './RelatorioActions';
import { exportToPdf } from '@/utils/pdfExport';

interface RelatorioDetalhadoProps {
  auditoria: any;
  secoes: any[];
  perguntas: any[];
  refetchAuditoria: () => void;
}

export const RelatorioDetalhado: React.FC<RelatorioDetalhadoProps> = ({ 
  auditoria, 
  secoes, 
  perguntas,
  refetchAuditoria
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Fetch available users for select dropdowns
  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calcular pontuação por seção com a nova lógica de pontuação
  const calcularPontuacaoPorSecao = () => {
    if (!auditoria.respostas || !secoes || !perguntas) return [];
    
    // Agrupa perguntas por seção
    const perguntasPorSecao = perguntas.reduce((acc, pergunta) => {
      if (!acc[pergunta.secao_id]) {
        acc[pergunta.secao_id] = [];
      }
      acc[pergunta.secao_id].push(pergunta);
      return acc;
    }, {} as Record<string, typeof perguntas>);
    
    // Calcula pontuação para cada seção
    return secoes.map(secao => {
      const perguntasSecao = perguntasPorSecao[secao.id] || [];
      const respostasSecao = auditoria.respostas.filter(resposta => 
        perguntasSecao.some(pergunta => pergunta.id === resposta.pergunta_id)
      );
      
      let pontuacao = 0;
      respostasSecao.forEach(resposta => {
        switch(resposta.resposta) {
          case 'Sim':
            pontuacao += 1;
            break;
          case 'Não':
            pontuacao -= 1;
            break;
          case 'Regular':
            pontuacao += 0.5;
            break;
          // 'N/A' doesn't affect score
        }
      });
      
      return {
        id: secao.id,
        nome: secao.nome,
        pontuacao: pontuacao,
        total: perguntasSecao.length,
        percentual: perguntasSecao.length > 0 
          ? (pontuacao / perguntasSecao.length) * 100 
          : 0
      };
    });
  };

  // Calcular pontuação total corretamente
  const calcularPontuacaoTotal = () => {
    if (!auditoria.respostas) return 0;
    
    return auditoria.respostas.reduce((total, resposta) => {
      switch(resposta.resposta) {
        case 'Sim':
          return total + 1;
        case 'Não':
          return total - 1;
        case 'Regular':
          return total + 0.5;
        default:
          return total;
      }
    }, 0);
  };

  const pontuacoesPorSecao = calcularPontuacaoPorSecao();
  const pontuacaoTotal = calcularPontuacaoTotal();

  // Atualiza a auditoria com a pontuação total calculada
  useEffect(() => {
    const updateAuditoriaScore = async () => {
      await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoria.id);
    };

    updateAuditoriaScore();
  }, [pontuacaoTotal, auditoria.id]);

  // Get items that need attention (negative score)
  const getItensCriticos = () => {
    if (!auditoria.respostas || !perguntas) return [];
    
    return auditoria.respostas
      .filter(resposta => resposta.resposta === 'Não')
      .map(resposta => {
        const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
        const secao = secoes?.find(s => s.id === pergunta?.secao_id);
        return {
          id: resposta.id,
          pergunta_texto: pergunta?.texto || 'Pergunta não encontrada',
          secao_nome: secao?.nome || 'Seção não encontrada',
          observacao: 'Item não conforme'
        };
      });
  };

  // Get the critical items by calling the function
  const itensCriticos = getItensCriticos();

  // Generate and download PDF
  const exportarPDF = () => {
    exportToPdf(reportRef, undefined, "O relatório foi exportado com sucesso!");
  };

  return (
    <div>
      <RelatorioActions 
        auditoria={auditoria} 
        usuarios={usuarios || []} 
        refetchAuditoria={refetchAuditoria}
        exportarPDF={exportarPDF}
      />
      
      <div ref={reportRef} className="space-y-6">
        <PageTitle 
          title="Relatório de Auditoria"
          description="Resumo completo da auditoria realizada"
        />
        
        <InformacoesGerais 
          auditoria={{
            ...auditoria,
            pontuacao_total: pontuacaoTotal
          }} 
        />
        
        <PontuacaoPorSecao pontuacoesPorSecao={pontuacoesPorSecao} />
        
        {itensCriticos.length > 0 && (
          <PontosAtencao itensCriticos={itensCriticos} />
        )}
        
        <AnaliseGeral 
          pontuacaoTotal={pontuacaoTotal} 
          pontuacoesPorSecao={pontuacoesPorSecao}
          itensCriticos={itensCriticos}
        />
      </div>
    </div>
  );
};
