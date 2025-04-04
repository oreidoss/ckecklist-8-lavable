
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
  return (
    <div className="space-y-4">
      <Card>
        <InformacoesGerais auditoria={auditoria} />
      </Card>

      <Card>
        <InfoLoja loja={loja} />
      </Card>

      <Card>
        <AnaliseGeral respostas={respostas} perguntas={perguntas} />
      </Card>

      <Card>
        <PontuacaoPorSecao respostas={respostas} perguntas={perguntas} secoes={secoes} />
      </Card>

      <Card>
        <PontosAtencao respostas={respostas} perguntas={perguntas} />
      </Card>
      
      <AnaliseIA respostas={respostas} perguntas={perguntas} />

      <Card>
        <HistoricoAuditorias auditorias={auditorias} lojaId={loja.id} />
      </Card>

      <Card>
        <HistoricoLoja loja={loja} auditorias={auditorias} />
      </Card>

      <Card>
        <AnaliseTendencias auditorias={auditorias} lojaId={loja.id} />
      </Card>
    </div>
  );
};

export default RelatorioDetalhado;
