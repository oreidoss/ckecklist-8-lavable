
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnaliseIAProps {
  pontuacaoTotal: number;
  pontuacoesPorSecao: any[];
  itensCriticos: any[];
  itensAtencao: any[];
  lojaNome: string;
  lojaNumero: string;
  setAnaliseCompleta?: (completa: boolean) => void;
}

export const AnaliseIA: React.FC<AnaliseIAProps> = ({
  pontuacaoTotal,
  pontuacoesPorSecao,
  itensCriticos,
  itensAtencao,
  lojaNome,
  lojaNumero,
  setAnaliseCompleta
}) => {
  const [analise, setAnalise] = useState<string>('');
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const gerarAnaliseIA = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Preparar os dados para enviar para a IA
      const dadosParaAnalise = {
        lojaNome,
        lojaNumero,
        pontuacaoTotal,
        pontuacoesPorSecao: pontuacoesPorSecao.map(s => ({
          nome: s.nome,
          pontuacao: s.pontuacao,
          percentual: s.percentual
        })),
        itensCriticos: itensCriticos.map(item => ({
          secao: item.secao_nome,
          problema: item.pergunta_texto,
          pontuacao: -1
        })),
        itensAtencao: itensAtencao.map(item => ({
          secao: item.secao_nome,
          problema: item.pergunta_texto,
          pontuacao: 0.5
        }))
      };

      // Em vez de chamar uma API externa de IA, vamos simular a análise com base nas pontuações
      // Em um ambiente real, você substituiria esta parte por uma chamada para um serviço de IA
      
      // Simulando processamento da IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Análise baseada na pontuação
      let analiseTexto = '';
      let recomendacoesLista: string[] = [];
      
      if (pontuacaoTotal > 5) {
        analiseTexto = `A loja ${lojaNumero} - ${lojaNome} apresenta um bom desempenho geral, com uma pontuação de ${pontuacaoTotal.toFixed(1)} pontos. No entanto, foram identificados ${itensCriticos.length} itens críticos (pontuação -1) e ${itensAtencao.length} itens que requerem atenção.`;
        
        if (itensCriticos.length > 0) {
          analiseTexto += ` Os principais pontos críticos estão nas seções: ${[...new Set(itensCriticos.slice(0, 3).map(i => i.secao_nome))].join(', ')}.`;
          
          // Agrupar recomendações por seção
          const secoesCriticas = [...new Set(itensCriticos.map(i => i.secao_nome))];
          secoesCriticas.forEach(secao => {
            const problemasSecao = itensCriticos.filter(i => i.secao_nome === secao);
            recomendacoesLista.push(`Na seção ${secao}, priorize a correção dos seguintes problemas: ${problemasSecao.slice(0, 2).map(p => p.pergunta_texto).join('; ')}${problemasSecao.length > 2 ? ' e outros.' : '.'}`);
          });
        }
      } else if (pontuacaoTotal > 0) {
        analiseTexto = `A loja ${lojaNumero} - ${lojaNome} apresenta um desempenho satisfatório, com pontuação de ${pontuacaoTotal.toFixed(1)} pontos, porém existem várias áreas que requerem atenção imediata. Foram identificados ${itensCriticos.length} itens críticos (pontuação -1) e ${itensAtencao.length} itens que requerem atenção.`;
        
        // Adicionar recomendações por seções problemáticas
        const secoesCriticas = [...new Set(itensCriticos.map(i => i.secao_nome))];
        secoesCriticas.forEach(secao => {
          recomendacoesLista.push(`Implemente um plano de ação urgente para a seção ${secao}, focando nos itens não conformes.`);
        });
        
        recomendacoesLista.push(`Realize treinamento com a equipe sobre os procedimentos operacionais, especialmente nas áreas de ${secoesCriticas.slice(0, 3).join(', ')}.`);
      } else {
        analiseTexto = `A loja ${lojaNumero} - ${lojaNome} apresenta um desempenho crítico, com pontuação de ${pontuacaoTotal.toFixed(1)} pontos. A situação demanda intervenção imediata. Foram identificados ${itensCriticos.length} itens críticos (pontuação -1) que estão impactando severamente o desempenho.`;
        
        recomendacoesLista.push(`Acione imediatamente a supervisão regional para desenvolver um plano de recuperação emergencial.`);
        recomendacoesLista.push(`Designe uma equipe especializada para focar exclusivamente na correção dos itens críticos.`);
        recomendacoesLista.push(`Estabeleça metas diárias de progresso e realize verificações frequentes.`);
        recomendacoesLista.push(`Providencie treinamento intensivo e acompanhamento presencial para a equipe.`);
      }
      
      // Adicionar recomendações gerais
      if (pontuacoesPorSecao.some(s => s.pontuacao < 0)) {
        const secoesNegativas = pontuacoesPorSecao.filter(s => s.pontuacao < 0).map(s => s.nome);
        recomendacoesLista.push(`Crie um cronograma detalhado para acompanhar a implementação das melhorias nas seções: ${secoesNegativas.join(', ')}.`);
      }
      
      setAnalise(analiseTexto);
      setRecomendacoes(recomendacoesLista);

      if (setAnaliseCompleta) {
        setAnaliseCompleta(true);
      }
    } catch (err) {
      setError('Não foi possível gerar a análise de IA. Por favor, tente novamente.');
      console.error('Erro ao gerar análise de IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar análise automaticamente na primeira vez
  useEffect(() => {
    if (itensCriticos.length > 0 || itensAtencao.length > 0) {
      gerarAnaliseIA();
    } else {
      // Se não houver itens para analisar, definir uma mensagem padrão
      setAnalise(`A loja ${lojaNumero} - ${lojaNome} não apresenta pontos críticos ou itens que requeiram atenção imediata. Continue com o bom trabalho e foque na manutenção dos padrões atuais.`);
      setRecomendacoes(['Mantenha os procedimentos operacionais atuais', 'Implemente um programa de reconhecimento para a equipe', 'Compartilhe as boas práticas dessa unidade com outras lojas']);
      
      if (setAnaliseCompleta) {
        setAnaliseCompleta(true);
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Análise Inteligente</CardTitle>
          <CardDescription>
            Avaliação e recomendações baseadas em inteligência artificial
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={gerarAnaliseIA} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {isLoading ? (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <Bot className="h-8 w-8 text-primary/80" />
                <div>
                  <h3 className="text-lg font-medium">Gerando análise inteligente</h3>
                  <p className="text-muted-foreground text-sm">Processando os dados da auditoria...</p>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/5 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-primary" />
                  Análise da Situação
                </h3>
                <p className="text-muted-foreground">{analise}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Recomendações</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {recomendacoes.map((recomendacao, index) => (
                    <li key={index}>{recomendacao}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
