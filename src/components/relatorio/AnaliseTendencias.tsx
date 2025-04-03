
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
              {auditorias.length > 1 ? (
                (() => {
                  const primeiraAuditoria = auditorias[auditorias.length - 1];
                  const ultimaAuditoria = auditorias[0];
                  const diferenca = (ultimaAuditoria.pontuacao_total || 0) - (primeiraAuditoria.pontuacao_total || 0);
                  
                  if (diferenca > 0) {
                    return `A loja apresenta uma tendência de melhoria. Desde a primeira auditoria registrada, houve um aumento de ${diferenca.toFixed(1)} pontos na pontuação geral.`;
                  } else if (diferenca < 0) {
                    return `A loja apresenta uma tendência de queda no desempenho. Desde a primeira auditoria registrada, houve uma redução de ${Math.abs(diferenca).toFixed(1)} pontos na pontuação geral.`;
                  } else {
                    return "A loja mantém um desempenho estável ao longo do tempo, sem variações significativas na pontuação geral.";
                  }
                })()
              ) : (
                "Apenas uma auditoria foi realizada até o momento, não sendo possível analisar tendências."
              )}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Problemas Recorrentes</h3>
            <p className="text-muted-foreground">
              Baseado nas auditorias realizadas, os seguintes pontos requerem atenção constante:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
              {auditorias
                .flatMap(auditoria => 
                  auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                )
                .slice(0, 3)
                .map((resposta, index) => {
                  const pergunta = perguntas?.find(p => p.id === resposta.pergunta_id);
                  return (
                    <li key={index}>{pergunta?.texto || 'Item não identificado'}</li>
                  );
                })}
              {auditorias
                .flatMap(auditoria => 
                  auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                ).length === 0 && (
                <li>Nenhum problema recorrente identificado</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recomendação</h3>
            <p className="text-muted-foreground">
              {auditorias
                .flatMap(auditoria => 
                  auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                ).length > 0 ? (
                "Implementar planos de ação específicos para corrigir os problemas recorrentes identificados e realizar monitoramento constante para garantir a efetividade das ações."
              ) : (
                "Manter o padrão atual de operação e buscar melhorias contínuas em todas as áreas avaliadas."
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
