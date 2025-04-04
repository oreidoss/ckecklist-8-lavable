
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface AnaliseIAProps {
  pontuacaoTotal: number;
  pontuacoesPorSecao: Array<{
    id: string | number;
    nome: string;
    pontuacao: number;
    total: number;
    percentual: number;
  }>;
  itensCriticos: Array<any>;
  itensAtencao: Array<any>;
  lojaNome: string;
  lojaNumero: string;
  setAnaliseCompleta: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnaliseIA: React.FC<AnaliseIAProps> = ({
  pontuacaoTotal,
  pontuacoesPorSecao,
  itensCriticos,
  itensAtencao,
  lojaNome,
  lojaNumero,
  setAnaliseCompleta
}) => {
  const [analise, setAnalise] = useState("");
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating AI analysis process
    const gerarAnalise = () => {
      setLoading(true);
      // Allow time for UI to render loading state
      setTimeout(() => {
        let analiseText = `Após análise das respostas da auditoria da loja ${lojaNome} (${lojaNumero}), `;
        
        if (pontuacaoTotal >= 80) {
          analiseText += "foi verificado que a loja está com um desempenho muito bom. ";
        } else if (pontuacaoTotal >= 60) {
          analiseText += "foi verificado que a loja está com desempenho satisfatório, mas com pontos de melhoria. ";
        } else {
          analiseText += "foi verificado que a loja está com desempenho abaixo do esperado, necessitando de atenção imediata. ";
        }

        // Analysis of critical points
        if (itensCriticos.length > 0) {
          analiseText += `Foram identificados ${itensCriticos.length} pontos críticos que necessitam de ação imediata. `;
        } else {
          analiseText += "Não foram identificados pontos críticos, o que é um excelente indicador. ";
        }

        // Analysis of attention points
        if (itensAtencao.length > 0) {
          analiseText += `Também há ${itensAtencao.length} pontos de atenção que devem ser monitorados. `;
        }

        // Section analysis
        const secoesBaixas = pontuacoesPorSecao.filter(s => s.percentual < 60);
        if (secoesBaixas.length > 0) {
          analiseText += `As seções ${secoesBaixas.map(s => s.nome).join(", ")} apresentam as piores pontuações e devem receber prioridade nas ações corretivas.`;
        }

        // Generate recommendations
        const recs = [];
        
        if (itensCriticos.length > 0) {
          recs.push("Elaborar um plano de ação urgente para resolver os pontos críticos identificados.");
        }
        
        if (secoesBaixas.length > 0) {
          recs.push(`Realizar treinamento específico nas seções ${secoesBaixas.map(s => s.nome).join(", ")}.`);
        }
        
        if (pontuacaoTotal < 70) {
          recs.push("Agendar uma nova auditoria em 30 dias para verificar o progresso das melhorias.");
        }
        
        recs.push("Compartilhar os resultados com a equipe e definir metas claras para a próxima avaliação.");
        
        if (pontuacaoTotal >= 80) {
          recs.push("Reconhecer e premiar a equipe pelo bom desempenho.");
        }

        setAnalise(analiseText);
        setRecomendacoes(recs);
        setLoading(false);
        setAnaliseCompleta(true);
      }, 1500);
    };

    gerarAnalise();
  }, [
    pontuacaoTotal, 
    pontuacoesPorSecao, 
    itensCriticos, 
    itensAtencao, 
    lojaNome, 
    lojaNumero, 
    setAnaliseCompleta
  ]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Análise IA
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          )}
        </CardTitle>
        <CardDescription>
          Análise automatizada baseada nos resultados da auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-700">
              {analise}
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="recommendations">
                <AccordionTrigger className="text-md font-medium">
                  Recomendações
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    {recomendacoes.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnaliseIA;
