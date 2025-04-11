
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface AnaliseTendenciasProps {
  auditorias: any[];
  perguntas: any[];
}

export const AnaliseTendencias: React.FC<AnaliseTendenciasProps> = ({ 
  auditorias,
  perguntas
}) => {
  // Função para calcular a tendência com base nas auditorias
  const calcularTendencia = () => {
    if (auditorias.length <= 1) {
      return "Apenas uma auditoria foi realizada até o momento, não sendo possível analisar tendências.";
    }
    
    // Ordenar auditorias por data (mais antiga primeiro)
    const auditoriasOrdenadas = [...auditorias].sort((a, b) => 
      new Date(a.data || '').getTime() - new Date(b.data || '').getTime()
    );
    
    const primeiraAuditoria = auditoriasOrdenadas[0];
    const ultimaAuditoria = auditoriasOrdenadas[auditoriasOrdenadas.length - 1];
    const diferenca = (ultimaAuditoria.pontuacao_total || 0) - (primeiraAuditoria.pontuacao_total || 0);
    
    if (diferenca > 0) {
      return `A loja apresenta uma tendência de melhoria. Desde a primeira auditoria registrada, houve um aumento de ${diferenca.toFixed(1)} pontos na pontuação geral.`;
    } else if (diferenca < 0) {
      return `A loja apresenta uma tendência de queda no desempenho. Desde a primeira auditoria registrada, houve uma redução de ${Math.abs(diferenca).toFixed(1)} pontos na pontuação geral.`;
    } else {
      return "A loja mantém um desempenho estável ao longo do tempo, sem variações significativas na pontuação geral.";
    }
  };

  // Identificar problemas recorrentes (perguntas respondidas com "não" mais frequentemente)
  const identificarProblemasRecorrentes = () => {
    // Mapear todas as respostas "não" de todas as auditorias
    const respostasNegativas = auditorias
      .flatMap(auditoria => 
        auditoria.respostas?.filter(r => r.resposta === 'nao' || r.resposta === 'Não' || r.pontuacao_obtida < 0) || []
      );
    
    // Contar ocorrências por pergunta_id
    const contagem = respostasNegativas.reduce((acc, resposta) => {
      acc[resposta.pergunta_id] = (acc[resposta.pergunta_id] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar por frequência (do mais frequente para o menos frequente)
    const perguntasOrdenadas = Object.entries(contagem)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 3) // Pegar os 3 problemas mais recorrentes
      .map(([perguntaId]) => {
        const pergunta = perguntas?.find(p => p.id === perguntaId);
        return pergunta ? pergunta.texto : 'Item não identificado';
      });
    
    return perguntasOrdenadas;
  };

  // Gerar recomendação com base na análise
  const gerarRecomendacao = (problemas) => {
    if (problemas.length === 0) {
      return "Manter o padrão atual de operação e buscar melhorias contínuas em todas as áreas avaliadas.";
    }
    
    return "Implementar planos de ação específicos para corrigir os problemas recorrentes identificados e realizar monitoramento constante para garantir a efetividade das ações.";
  };

  const tendencia = calcularTendencia();
  const problemasRecorrentes = identificarProblemasRecorrentes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Tendências</CardTitle>
        <CardDescription>Evolução da loja ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Resumo da Evolução</h3>
            <p className="text-muted-foreground">
              {tendencia}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Problemas Recorrentes</h3>
            <p className="text-muted-foreground">
              Baseado nas auditorias realizadas, os seguintes pontos requerem atenção constante:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
              {problemasRecorrentes.length > 0 ? (
                problemasRecorrentes.map((problema, index) => (
                  <li key={index}>{problema}</li>
                ))
              ) : (
                <li>Nenhum problema recorrente identificado</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recomendação</h3>
            <p className="text-muted-foreground">
              {gerarRecomendacao(problemasRecorrentes)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
