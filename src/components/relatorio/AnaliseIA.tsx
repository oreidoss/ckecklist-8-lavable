
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Resposta, Pergunta } from '@/lib/types';

interface AnaliseIAProps {
  respostas: Resposta[];
  perguntas: Pergunta[];
}

const AnaliseIA: React.FC<AnaliseIAProps> = ({ respostas, perguntas }) => {
  // Identifica pontos críticos (pontuação -1)
  const pontosCriticos = respostas.filter(r => r.pontuacao_obtida === -1);
  
  // Identifica pontos de atenção (pontuação 0)
  const pontosAtencao = respostas.filter(r => r.pontuacao_obtida === 0);
  
  // Helper para encontrar o texto da pergunta baseado no ID
  const getTextoPergunta = (perguntaId: string) => {
    const pergunta = perguntas.find(p => p.id === perguntaId);
    return pergunta ? pergunta.texto : 'Pergunta não encontrada';
  };
  
  // Gera análise baseada nos pontos críticos e de atenção
  const gerarAnalise = () => {
    let analise = '';
    
    if (pontosCriticos.length === 0 && pontosAtencao.length === 0) {
      return "Parabéns! Não foram identificados pontos críticos ou de atenção nesta auditoria. Continue mantendo o excelente padrão de qualidade.";
    }
    
    if (pontosCriticos.length > 0) {
      analise += `Foram identificados ${pontosCriticos.length} pontos críticos que requerem ação imediata:\n\n`;
      pontosCriticos.forEach((ponto, index) => {
        analise += `${index + 1}. ${getTextoPergunta(ponto.pergunta_id)}: Recomenda-se implementar um plano de ação corretiva imediato, com revisão dos procedimentos relacionados.\n`;
      });
    }
    
    if (pontosAtencao.length > 0) {
      if (analise) analise += '\n\n';
      analise += `Além disso, há ${pontosAtencao.length} pontos que merecem atenção:\n\n`;
      pontosAtencao.forEach((ponto, index) => {
        analise += `${index + 1}. ${getTextoPergunta(ponto.pergunta_id)}: Recomenda-se monitoramento contínuo e ações preventivas para evitar deterioração.\n`;
      });
    }
    
    analise += '\n\nObservações gerais: ';
    
    if (pontosCriticos.length > pontosAtencao.length) {
      analise += 'Esta unidade apresenta problemas estruturais significativos que precisam ser abordados com prioridade. Recomenda-se uma revisão completa dos processos e treinamento da equipe.';
    } else if (pontosCriticos.length > 0) {
      analise += 'Embora existam pontos críticos a serem corrigidos, a maioria dos processos está funcionando adequadamente. Recomenda-se focar nas correções pontuais identificadas.';
    } else {
      analise += 'A unidade apresenta bom desempenho geral, com apenas alguns pontos de atenção. Recomenda-se ações preventivas para manter e melhorar os padrões.';
    }
    
    return analise;
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
        <div className="whitespace-pre-line text-sm">
          {gerarAnalise()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnaliseIA;
