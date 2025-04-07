
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface PontuacaoSecao {
  id: string;
  nome: string;
  pontuacao: number;
  total: number; // Total number of questions
  percentual: number; // Percentage score
}

interface ItemCritico {
  id: string;
  pergunta_texto: string;
  secao_nome: string;
  observacao: string;
  pontuacao: number;
}

interface AnaliseGeralProps {
  pontuacaoTotal: number;
  pontuacoesPorSecao: PontuacaoSecao[];
  itensCriticos: ItemCritico[];
}

export const AnaliseGeral: React.FC<AnaliseGeralProps> = ({ 
  pontuacaoTotal,
  pontuacoesPorSecao,
  itensCriticos
}) => {
  // Count critical items (-1) and attention items (0/0.5)
  const itensCriticosCount = itensCriticos.filter(item => item.pontuacao === -1).length;
  const itensAtencaoCount = itensCriticos.filter(item => item.pontuacao === 0 || item.pontuacao === 0.5).length;
  
  // Calculate overall performance rating based on actual questions
  const totalPerguntas = pontuacoesPorSecao.reduce((sum, secao) => sum + secao.total, 0);
  const percentualTotal = totalPerguntas > 0 ? (pontuacaoTotal / totalPerguntas) * 100 : 0;
  
  // Identify points with consistently negative scores
  const pontosFracos = pontuacoesPorSecao
    .filter(secao => secao.pontuacao < 0)
    .sort((a, b) => a.pontuacao - b.pontuacao);
    
  // Identify points with good scores relative to question count
  const pontosFortes = pontuacoesPorSecao
    .filter(secao => secao.pontuacao > 0 && secao.percentual >= 70)
    .sort((a, b) => b.percentual - a.percentual);
  
  // Generate appropriate conclusion based on scores
  const getConclusion = () => {
    if (itensCriticosCount > 10) {
      return "A loja apresenta problemas críticos que necessitam atenção imediata. Diversos processos precisam ser revistos urgentemente.";
    } else if (itensCriticosCount > 5) {
      return "A loja apresenta desempenho insatisfatório com pontos críticos que precisam ser tratados com prioridade.";
    } else if (itensCriticosCount > 0) {
      return "A loja apresenta desempenho razoável, porém com alguns pontos críticos que requerem atenção específica.";
    } else if (itensAtencaoCount > 10) {
      return "A loja apresenta desempenho satisfatório, mas com vários pontos de atenção que precisam ser melhorados.";
    } else if (itensAtencaoCount > 0) {
      return "A loja apresenta um bom desempenho geral, com poucos pontos de atenção a serem trabalhados.";
    } else {
      return "A loja apresenta excelente desempenho, com padrões adequados de qualidade e operação.";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Geral</CardTitle>
        <CardDescription>Resumo do desempenho da loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Conclusão</h3>
            <p className="text-muted-foreground">
              {getConclusion()}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fortes</h3>
            {pontosFortes.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontosFortes
                  .slice(0, 3)
                  .map(secao => (
                    <li key={secao.id}>{secao.nome} ({secao.pontuacao.toFixed(1)} pontos)</li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fortes significativos nesta auditoria.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fracos</h3>
            {pontosFracos.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontosFracos
                  .slice(0, 3)
                  .map(secao => (
                    <li key={secao.id}>
                      {secao.nome} ({secao.pontuacao.toFixed(1)} pontos)
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fracos significativos nesta auditoria.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recomendações</h3>
            <p className="text-muted-foreground">
              {itensCriticosCount > 0 ? (
                `Focar na correção dos ${itensCriticosCount} itens críticos identificados${
                  pontosFracos.length > 0 
                    ? `, especialmente nas áreas de ${pontosFracos.slice(0, 3).map(pf => pf.nome).join(', ')}.` 
                    : '.'
                }`
              ) : itensAtencaoCount > 0 ? (
                `Implementar melhorias nos ${itensAtencaoCount} itens de atenção identificados para elevar o padrão geral da loja.`
              ) : (
                "Manter o padrão atual de operação e buscar melhorias contínuas."
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
