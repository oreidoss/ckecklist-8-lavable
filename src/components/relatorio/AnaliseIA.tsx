
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Resposta, Pergunta } from '@/lib/types';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface AnaliseIAProps {
  respostas: Resposta[];
  perguntas: Pergunta[];
}

const AnaliseIA: React.FC<AnaliseIAProps> = ({ respostas, perguntas }) => {
  // Identifica pontos críticos (pontuação -1)
  const pontosCriticos = respostas.filter(r => r.pontuacao_obtida === -1);
  
  // Identifica pontos de atenção (pontuação 0)
  const pontosAtencao = respostas.filter(r => r.pontuacao_obtida === 0);
  
  // Identifica pontos regulares (pontuação 0.5)
  const pontosRegulares = respostas.filter(r => r.pontuacao_obtida === 0.5);
  
  // Helper para encontrar o texto da pergunta baseado no ID
  const getTextoPergunta = (perguntaId: string) => {
    const pergunta = perguntas.find(p => p.id === perguntaId);
    return pergunta ? pergunta.texto : 'Pergunta não encontrada';
  };
  
  // Gera observações específicas para cada ponto crítico
  const gerarObservacaoPontoCritico = (resposta: Resposta) => {
    const perguntaTexto = getTextoPergunta(resposta.pergunta_id);
    
    // Usar observação do auditor se existir
    if (resposta.observacao) {
      return `O auditor observou: "${resposta.observacao}". Recomenda-se ação corretiva imediata.`;
    }
    
    // Gerar observação baseada no texto da pergunta
    if (perguntaTexto.toLowerCase().includes('limpeza')) {
      return 'Implemente um cronograma de limpeza diário com responsáveis definidos e checklist de verificação.';
    } else if (perguntaTexto.toLowerCase().includes('estoque')) {
      return 'Realize inventário completo e implemente sistema de controle de estoque com alertas de nível baixo.';
    } else if (perguntaTexto.toLowerCase().includes('atendimento')) {
      return 'Desenvolva treinamento específico para a equipe de atendimento e implemente avaliações periódicas.';
    } else if (perguntaTexto.toLowerCase().includes('segurança')) {
      return 'Revise protocolos de segurança e realize treinamento de emergência com toda a equipe.';
    } else {
      return 'Estabeleça um plano de ação corretiva com prazos definidos e responsáveis pela implementação.';
    }
  };
  
  // Gera observações específicas para cada ponto de atenção
  const gerarObservacaoPontoAtencao = (resposta: Resposta) => {
    const perguntaTexto = getTextoPergunta(resposta.pergunta_id);
    
    // Usar observação do auditor se existir
    if (resposta.observacao) {
      return `O auditor observou: "${resposta.observacao}". Recomenda-se monitoramento contínuo.`;
    }
    
    // Gerar observação baseada no texto da pergunta
    if (perguntaTexto.toLowerCase().includes('limpeza')) {
      return 'Reforce a frequência das rotinas de limpeza e mantenha registros visuais de conformidade.';
    } else if (perguntaTexto.toLowerCase().includes('estoque')) {
      return 'Aumente a frequência das conferências de estoque e verifique a organização dos produtos.';
    } else if (perguntaTexto.toLowerCase().includes('atendimento')) {
      return 'Realize reuniões semanais para feedback sobre qualidade de atendimento e reforce boas práticas.';
    } else if (perguntaTexto.toLowerCase().includes('segurança')) {
      return 'Faça verificações mais frequentes dos equipamentos de segurança e procedimentos.';
    } else {
      return 'Monitore este item com maior frequência e estabeleça metas progressivas de melhoria.';
    }
  };
  
  // Gera observações específicas para cada ponto regular
  const gerarObservacaoPontoRegular = (resposta: Resposta) => {
    const perguntaTexto = getTextoPergunta(resposta.pergunta_id);
    
    // Usar observação do auditor se existir
    if (resposta.observacao) {
      return `O auditor observou: "${resposta.observacao}". Recomenda-se melhorias graduais.`;
    }
    
    // Gerar observação baseada no texto da pergunta
    if (perguntaTexto.toLowerCase().includes('limpeza')) {
      return 'Busque elevar o padrão de limpeza com treinamentos específicos e produtos adequados.';
    } else if (perguntaTexto.toLowerCase().includes('estoque')) {
      return 'Aprimore a organização do estoque com etiquetas e demarcações mais visíveis.';
    } else if (perguntaTexto.toLowerCase().includes('atendimento')) {
      return 'Incentive a equipe a desenvolver abordagens mais personalizadas no atendimento ao cliente.';
    } else if (perguntaTexto.toLowerCase().includes('segurança')) {
      return 'Revise e atualize a sinalização de segurança para maior visibilidade e clareza.';
    } else {
      return 'Continue o trabalho já realizado, buscando melhorias incrementais para atingir a excelência.';
    }
  };
  
  // Gera análise detalhada baseada nos pontos críticos e de atenção
  const gerarAnaliseDetalhada = () => {
    if (pontosCriticos.length === 0 && pontosAtencao.length === 0 && pontosRegulares.length === 0) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            <span className="font-medium text-green-700">Excelente Desempenho</span>
          </div>
          <p className="mt-2 text-green-600">
            Parabéns! Não foram identificados pontos críticos ou de atenção nesta auditoria. Continue mantendo o excelente padrão de qualidade.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {pontosCriticos.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              <span className="font-medium text-red-700">Pontos Críticos (-1) • {pontosCriticos.length}</span>
            </div>
            <p className="mb-4 text-red-700">
              Foram identificados {pontosCriticos.length} pontos críticos que requerem ação imediata:
            </p>
            <ul className="space-y-4">
              {pontosCriticos.map((ponto, index) => (
                <li key={ponto.id} className="border-l-2 border-red-400 pl-4">
                  <p className="font-medium">{index + 1}. {getTextoPergunta(ponto.pergunta_id)}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium text-red-600">Recomendação: </span>
                    {gerarObservacaoPontoCritico(ponto)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {pontosAtencao.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              <span className="font-medium text-yellow-700">Pontos de Atenção (0) • {pontosAtencao.length}</span>
            </div>
            <p className="mb-4 text-yellow-700">
              Foram identificados {pontosAtencao.length} pontos que merecem atenção:
            </p>
            <ul className="space-y-4">
              {pontosAtencao.map((ponto, index) => (
                <li key={ponto.id} className="border-l-2 border-yellow-400 pl-4">
                  <p className="font-medium">{index + 1}. {getTextoPergunta(ponto.pergunta_id)}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium text-yellow-600">Recomendação: </span>
                    {gerarObservacaoPontoAtencao(ponto)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {pontosRegulares.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
              <span className="font-medium text-amber-600">Pontos Regulares (0.5) • {pontosRegulares.length}</span>
            </div>
            <p className="mb-4 text-amber-600">
              Foram identificados {pontosRegulares.length} pontos com desempenho regular:
            </p>
            <ul className="space-y-4">
              {pontosRegulares.map((ponto, index) => (
                <li key={ponto.id} className="border-l-2 border-amber-300 pl-4">
                  <p className="font-medium">{index + 1}. {getTextoPergunta(ponto.pergunta_id)}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium text-amber-500">Recomendação: </span>
                    {gerarObservacaoPontoRegular(ponto)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Gera conclusão e recomendações gerais
  const gerarConclusao = () => {
    if (pontosCriticos.length === 0 && pontosAtencao.length === 0 && pontosRegulares.length === 0) {
      return null;
    }
    
    let conclusao = '';
    
    if (pontosCriticos.length > 5) {
      conclusao = 'Esta unidade apresenta problemas estruturais significativos que precisam ser abordados com urgência. Recomenda-se uma revisão completa dos processos, treinamento intensivo da equipe e acompanhamento semanal até a normalização dos índices.';
    } else if (pontosCriticos.length > 0) {
      conclusao = `A unidade apresenta ${pontosCriticos.length} pontos críticos que necessitam correção imediata. Recomenda-se focar nas correções pontuais identificadas e estabelecer um cronograma de implementação com prazos curtos.`;
    } else if (pontosAtencao.length > 5) {
      conclusao = `A unidade apresenta ${pontosAtencao.length} pontos de atenção que, se não tratados, podem se tornar críticos. Recomenda-se estabelecer um plano preventivo para todos os itens identificados e revisão quinzenal.`;
    } else if (pontosRegulares.length > 5) {
      conclusao = `A unidade apresenta ${pontosRegulares.length} pontos com desempenho regular. Recomenda-se criar um plano de melhoria contínua com metas graduais para elevar o padrão.`;
    } else {
      conclusao = 'A unidade apresenta bom desempenho geral, com apenas alguns pontos de melhoria. Recomenda-se ações preventivas para manter e melhorar os padrões, com revisão mensal dos indicadores.';
    }
    
    return (
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-700 mb-2">Conclusão e Recomendações Gerais</h3>
        <p className="text-gray-700">
          {conclusao}
        </p>
        
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-sm text-blue-600 font-medium mb-2">Legenda de pontuações:</p>
          <ul className="text-sm space-y-1 text-gray-600">
            <li className="flex items-center">
              <span className="inline-block w-12">Sim = 1</span>
              <span className="ml-2 text-green-600">(Conforme)</span>
            </li>
            <li className="flex items-center">
              <span className="inline-block w-12">Reg. = 0.5</span>
              <span className="ml-2 text-amber-500">(Regular)</span>
            </li>
            <li className="flex items-center">
              <span className="inline-block w-12">N/A = 0</span>
              <span className="ml-2 text-blue-500">(Não aplicável)</span>
            </li>
            <li className="flex items-center">
              <span className="inline-block w-12">Não = -1</span>
              <span className="ml-2 text-red-500">(Não conforme)</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Análise e Recomendações da IA</CardTitle>
        <CardDescription>
          Análise automatizada baseada nos resultados da auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {gerarAnaliseDetalhada()}
          {gerarConclusao()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnaliseIA;
