
import React from 'react';
import { Auditoria, Loja, Pergunta, Resposta, Secao } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { AnaliseGeral } from './AnaliseGeral';
import { PontuacaoPorSecao } from './PontuacaoPorSecao';
import { PontosAtencao } from './PontosAtencao';
import { InformacoesGerais } from './InformacoesGerais';
import { InfoLoja } from './InfoLoja';
import { HistoricoAuditorias } from './HistoricoAuditorias';
import { HistoricoLoja } from './HistoricoLoja';
import AnaliseIA from './AnaliseIA';
import { AnaliseTendencias } from './AnaliseTendencias';

interface RelatorioDetalhadoProps {
  auditoria: Auditoria;
  loja: Loja;
  respostas: Resposta[];
  perguntas: Pergunta[];
  secoes: Secao[];
  auditorias: Auditoria[];
}

const RelatorioDetalhado: React.FC<RelatorioDetalhadoProps> = ({
  auditoria,
  loja,
  respostas,
  perguntas,
  secoes,
  auditorias,
}) => {
  // Prepare data for AnaliseGeral component
  const pontuacaoTotal = auditoria.pontuacao_total || 0;
  
  // Prepare data for PontuacaoPorSecao component
  const pontuacoesPorSecao = secoes.map(secao => {
    const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
    const respostasSecao = respostas.filter(r => 
      perguntasSecao.some(p => p.id === r.pergunta_id)
    );
    
    const pontuacao = respostasSecao.reduce((acc, r) => acc + (r.pontuacao_obtida || 0), 0);
    
    return {
      id: secao.id,
      nome: secao.nome,
      pontuacao,
      total: perguntasSecao.length,
      percentual: perguntasSecao.length > 0 ? (pontuacao / perguntasSecao.length) * 100 : 0
    };
  });
  
  // Prepare data for PontosAtencao component
  const itensCriticos = respostas
    .filter(r => r.pontuacao_obtida !== undefined && r.pontuacao_obtida <= 0)
    .map(r => {
      const pergunta = perguntas.find(p => p.id === r.pergunta_id);
      const secao = secoes.find(s => pergunta && s.id === pergunta.secao_id);
      
      return {
        id: r.id,
        pergunta_texto: pergunta ? pergunta.texto : 'Pergunta não encontrada',
        secao_nome: secao ? secao.nome : 'Seção não encontrada',
        observacao: r.observacao || 'Sem observação'
      };
    });

  return (
    <div className="space-y-4">
      <Card>
        <InformacoesGerais auditoria={auditoria} />
      </Card>

      <Card>
        <InfoLoja loja={loja} auditorias={auditorias} />
      </Card>

      <Card>
        <AnaliseGeral 
          pontuacaoTotal={pontuacaoTotal} 
          pontuacoesPorSecao={pontuacoesPorSecao} 
          itensCriticos={itensCriticos} 
        />
      </Card>

      <Card>
        <PontuacaoPorSecao pontuacoesPorSecao={pontuacoesPorSecao} />
      </Card>

      <Card>
        <PontosAtencao itensCriticos={itensCriticos} />
      </Card>
      
      <AnaliseIA respostas={respostas} perguntas={perguntas} />

      <Card>
        <HistoricoAuditorias auditorias={auditorias} />
      </Card>

      <Card>
        <HistoricoLoja auditoriasPorLoja={{ loja, auditorias }} perguntas={perguntas} />
      </Card>

      <Card>
        <AnaliseTendencias auditorias={auditorias} perguntas={perguntas} />
      </Card>
    </div>
  );
};

export default RelatorioDetalhado;
