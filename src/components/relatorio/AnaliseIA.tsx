
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resposta, pontuacaoMap } from "@/lib/types";
import { AlertTriangle, Info } from "lucide-react";

interface AnaliseIAProps {
  respostas: Resposta[];
  pontosCriticos: { pergunta: string; pontuacao: number }[];
  pontosAtencao: { pergunta: string; pontuacao: number }[];
}

export function AnaliseIA({ respostas, pontosCriticos, pontosAtencao }: AnaliseIAProps) {
  // Gerar uma análise baseada nos pontos críticos e de atenção
  const gerarAnaliseIA = () => {
    const totalRespostas = respostas.length;
    const respostasNegativas = respostas.filter(r => r.pontuacao_obtida < 0).length;
    const percentualNegativo = totalRespostas > 0 ? (respostasNegativas / totalRespostas) * 100 : 0;
    
    let situacaoGeral = "satisfatória";
    if (percentualNegativo > 30) {
      situacaoGeral = "crítica";
    } else if (percentualNegativo > 15) {
      situacaoGeral = "preocupante";
    }
    
    let recomendacao = "";
    
    if (pontosCriticos.length > 0) {
      recomendacao += "Recomendações para pontos críticos:\n";
      pontosCriticos.forEach(ponto => {
        const acao = getAcaoRecomendada(ponto.pergunta);
        recomendacao += `- ${ponto.pergunta}: ${acao}\n`;
      });
    }
    
    if (pontosAtencao.length > 0) {
      recomendacao += "\nRecomendações para pontos de atenção:\n";
      pontosAtencao.forEach(ponto => {
        const acao = getAcaoRecomendada(ponto.pergunta, false);
        recomendacao += `- ${ponto.pergunta}: ${acao}\n`;
      });
    }
    
    const conclusao = gerarConclusao(situacaoGeral, pontosCriticos.length, pontosAtencao.length);
    
    return {
      situacaoGeral,
      recomendacao,
      conclusao
    };
  };
  
  // Função para gerar uma ação recomendada com base na pergunta
  const getAcaoRecomendada = (pergunta: string, isCritico: boolean = true) => {
    const acoesCriticas = [
      "Implementar ação corretiva imediata",
      "Revisar processo com urgência",
      "Treinar equipe sobre este ponto específico",
      "Estabelecer verificação diária deste item",
      "Criar procedimento de verificação dupla"
    ];
    
    const acoesAtencao = [
      "Monitorar regularmente",
      "Incluir em auditorias semanais",
      "Conscientizar a equipe sobre este ponto",
      "Revisar processo nas próximas semanas",
      "Estabelecer meta de melhoria gradual"
    ];
    
    // Gera um índice pseudo-aleatório mas consistente baseado na pergunta
    const hashCode = pergunta.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const opcoes = isCritico ? acoesCriticas : acoesAtencao;
    const indice = hashCode % opcoes.length;
    
    return opcoes[indice];
  };
  
  // Gerar conclusão personalizada
  const gerarConclusao = (situacao: string, numCriticos: number, numAtencao: number) => {
    if (numCriticos === 0 && numAtencao === 0) {
      return "A auditoria não identificou pontos críticos ou de atenção. Recomenda-se manter os bons procedimentos e continuar com as práticas atuais.";
    }
    
    if (situacao === "crítica") {
      return `A situação é crítica com ${numCriticos} pontos críticos identificados. Recomenda-se uma intervenção imediata e revisão completa dos processos.`;
    } else if (situacao === "preocupante") {
      return `A situação é preocupante com ${numCriticos} pontos críticos e ${numAtencao} pontos de atenção. Recomenda-se atenção especial aos pontos críticos e estabelecer um plano de ação para os próximos 30 dias.`;
    } else {
      return `A situação geral é satisfatória, mas foram identificados ${numCriticos} pontos críticos e ${numAtencao} pontos de atenção que devem ser acompanhados. Recomenda-se incluir estes pontos no plano de melhoria contínua.`;
    }
  };
  
  const analise = gerarAnaliseIA();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Info className="mr-2 h-5 w-5" />
          Análise de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Situação Geral:</h3>
            <p className={`${
              analise.situacaoGeral === "crítica" 
                ? "text-red-500" 
                : analise.situacaoGeral === "preocupante" 
                  ? "text-amber-500" 
                  : "text-green-500"
            }`}>
              A auditoria apresenta uma situação {analise.situacaoGeral}.
            </p>
          </div>
          
          {(pontosCriticos.length > 0 || pontosAtencao.length > 0) && (
            <div>
              <h3 className="font-medium mb-1">Recomendações:</h3>
              <div className="pl-4 space-y-1 text-sm">
                {pontosCriticos.map((ponto, index) => (
                  <div key={`critico-${index}`} className="flex items-start gap-2 text-red-500">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-medium">{ponto.pergunta}:</span> {getAcaoRecomendada(ponto.pergunta)}
                    </p>
                  </div>
                ))}
                
                {pontosAtencao.map((ponto, index) => (
                  <div key={`atencao-${index}`} className="flex items-start gap-2 text-amber-500">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-medium">{ponto.pergunta}:</span> {getAcaoRecomendada(ponto.pergunta, false)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-1">Conclusão:</h3>
            <p className="text-sm">{analise.conclusao}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
