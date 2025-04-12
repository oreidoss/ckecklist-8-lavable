
import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

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
  
  // Enhanced identification of strengths and weaknesses
  const pontosFracos = useMemo(() => {
    return [...pontuacoesPorSecao]
      .filter(secao => secao.total > 0 && (secao.pontuacao < 0 || secao.percentual < 50))
      .sort((a, b) => a.percentual - b.percentual)
      .slice(0, 3);
  }, [pontuacoesPorSecao]);
  
  const pontosFortes = useMemo(() => {
    return [...pontuacoesPorSecao]
      .filter(secao => secao.total > 0 && secao.percentual >= 70)
      .sort((a, b) => b.percentual - a.percentual)
      .slice(0, 3);
  }, [pontuacoesPorSecao]);
  
  // More detailed and specific conclusions
  const getConclusion = () => {
    // Enhanced AI-based analysis for better insights
    if (percentualTotal >= 90) {
      return "A loja apresenta desempenho excelente, demonstrando alta aderência aos padrões de qualidade estabelecidos e uma gestão eficaz das operações e processos.";
    } else if (percentualTotal >= 80) {
      return "A loja apresenta um bom desempenho geral, com processos bem estabelecidos. Ainda há oportunidades pontuais de melhoria para atingir a excelência operacional.";
    } else if (percentualTotal >= 70) {
      return "A loja apresenta desempenho satisfatório, com diversos processos funcionando adequadamente, porém existem áreas importantes que necessitam de atenção para melhorar o desempenho global.";
    } else if (percentualTotal >= 60) {
      return "A loja apresenta desempenho razoável, porém com alguns pontos críticos que requerem atenção específica e ações corretivas para garantir a conformidade com os padrões esperados.";
    } else if (percentualTotal >= 50) {
      return "A loja apresenta desempenho abaixo do esperado, com várias áreas problemáticas que necessitam de intervenção estruturada e acompanhamento próximo da gestão.";
    } else {
      return "A loja apresenta desempenho insatisfatório, com problemas críticos em diversas áreas que requerem ação urgente e um plano de recuperação abrangente para reverter a situação atual.";
    }
  };
  
  // Generate more actionable recommendations
  const getRecommendations = () => {
    if (itensCriticosCount > 10) {
      return "Implementar um plano de ação urgente com intervenção direta da supervisão, priorizando os itens críticos identificados e realizando treinamentos específicos para as principais deficiências.";
    } else if (itensCriticosCount > 5) {
      return `Priorizar a correção dos ${itensCriticosCount} itens críticos identificados, com foco especial nas seções de ${pontosFracos.map(s => s.nome).join(', ')}, e implementar checklist diário de verificação destas áreas.`;
    } else if (itensCriticosCount > 0) {
      return `Corrigir os ${itensCriticosCount} itens críticos apontados na auditoria e implementar medidas preventivas para evitar recorrências, com acompanhamento semanal destes pontos.`;
    } else if (itensAtencaoCount > 10) {
      return "Embora sem itens críticos, é importante desenvolver planos de melhoria para os diversos itens de atenção identificados, priorizando aqueles com maior impacto na experiência do cliente.";
    } else if (itensAtencaoCount > 0) {
      return "Trabalhar nos pontos de atenção identificados para elevar ainda mais o padrão da loja, com foco na consistência das operações diárias e na experiência do cliente.";
    } else {
      return "Manter o excelente padrão atual de operação, documentar as melhores práticas implementadas na loja e considerá-la como referência para benchmarking interno.";
    }
  };

  const statusClass = () => {
    if (percentualTotal >= 80) return "text-green-600";
    if (percentualTotal >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const statusIcon = () => {
    if (percentualTotal >= 80) return <CheckCircle className="h-5 w-5 inline mr-2 text-green-500" />;
    if (percentualTotal >= 60) return <AlertCircle className="h-5 w-5 inline mr-2 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 inline mr-2 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Geral</CardTitle>
        <CardDescription>Resumo do desempenho da loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-2">Conclusão</h3>
            <p className={`${statusClass()} font-medium flex items-center`}>
              {statusIcon()}
              {percentualTotal.toFixed(0)}% de conformidade
            </p>
            <p className="text-muted-foreground mt-2">
              {getConclusion()}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fortes</h3>
            {pontosFortes.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontosFortes.map(secao => (
                  <li key={secao.id} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      <span className="font-medium">{secao.nome}</span> - 
                      {secao.percentual >= 90 
                        ? " Excelente desempenho" 
                        : " Bom desempenho"} 
                      ({secao.percentual.toFixed(0)}% de conformidade)
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fortes significativos nesta auditoria. Todas as áreas necessitam de melhorias.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fracos</h3>
            {pontosFracos.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontosFracos.map(secao => (
                  <li key={secao.id} className="flex items-start">
                    {secao.percentual < 30 ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                    )}
                    <span>
                      <span className="font-medium">{secao.nome}</span> - 
                      {secao.percentual < 30 
                        ? " Necessita intervenção urgente" 
                        : " Necessita melhorias"} 
                      ({secao.percentual.toFixed(0)}% de conformidade)
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fracos significativos nesta auditoria. A loja mantém um bom padrão em todas as áreas avaliadas.
              </p>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium mb-2 text-blue-800">Recomendações</h3>
            <p className="text-blue-700">
              {getRecommendations()}
            </p>
            
            {itensCriticosCount > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h4 className="font-medium text-blue-800 mb-1">Itens críticos a corrigir:</h4>
                <ul className="list-decimal list-inside space-y-1 text-blue-700">
                  {itensCriticos
                    .filter(item => item.pontuacao === -1)
                    .slice(0, 3)
                    .map((item) => (
                      <li key={item.id} className="text-sm">
                        {item.pergunta_texto} <span className="text-blue-600">({item.secao_nome})</span>
                      </li>
                    ))}
                  {itensCriticosCount > 3 && (
                    <li className="text-sm font-medium">
                      ... mais {itensCriticosCount - 3} {itensCriticosCount - 3 === 1 ? 'item' : 'itens'} críticos
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
