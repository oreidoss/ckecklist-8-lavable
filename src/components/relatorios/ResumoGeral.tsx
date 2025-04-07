
import React from 'react';
import { BarChart3, Target, Info } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface EstatisticasProps {
  total: number;
  lojasAuditadas: number;
  aprovadas: number;
  melhorias: number;
  criticas: number;
  media: number;
}

interface ResumoGeralProps {
  estatisticas: EstatisticasProps;
  auditorias: any[] | undefined;
}

export const ResumoGeral: React.FC<ResumoGeralProps> = ({ 
  estatisticas,
  auditorias
}) => {
  // Calculate average number of questions per audit
  const avgQuestionCount = auditorias && auditorias.length > 0
    ? Math.round(auditorias.reduce((acc, audit) => acc + (audit.respostas?.length || 0), 0) / auditorias.length)
    : 0;
    
  // Use this as our target total for consistency
  const metaTotal = avgQuestionCount;
  
  // Calculate total score based on audit average
  const pontuacaoTotal = estatisticas.media * estatisticas.total;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>
            Estatísticas gerais das auditorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">Total de Auditorias</span>
                <span className="text-3xl font-bold">{estatisticas.total}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">Lojas Auditadas</span>
                <span className="text-3xl font-bold">{estatisticas.lojasAuditadas}</span>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Distribuição de Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Aprovadas</span>
                <span className="text-sm font-medium">{estatisticas.aprovadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Melhorias Necessárias</span>
                <span className="text-sm font-medium">{estatisticas.melhorias}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Críticas</span>
                <span className="text-sm font-medium">{estatisticas.criticas}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pontuação Média Geral</h3>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md cursor-help">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">
                      Meta: {metaTotal} pts
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Detalhes da Pontuação Geral</h4>
                    <div className="text-sm">
                      <p className="mb-2">Informações detalhadas sobre o progresso geral:</p>
                      <div className="grid grid-cols-2 gap-2 bg-muted p-2 rounded-md">
                        <div>
                          <div className="text-xs text-muted-foreground">Pontuação Total</div>
                          <div className="font-medium">{pontuacaoTotal.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Meta por Auditoria</div>
                          <div className="font-medium">{metaTotal}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Progresso</div>
                          <div className="font-medium">
                            {metaTotal > 0 
                              ? `${Math.round((estatisticas.media / metaTotal) * 100)}%` 
                              : '0%'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Média por Loja</div>
                          <div className="font-medium">{estatisticas.media.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${
                      metaTotal > 0 
                        ? Math.min(
                            Math.max(
                              (estatisticas.media / metaTotal) * 100, 
                              0
                            ), 
                            100
                          ) 
                        : 0
                    }%` 
                  }}
                ></div>
              </div>
              <span className="ml-2 font-bold text-primary">
                {estatisticas.media.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Problemas Mais Frequentes</CardTitle>
          <CardDescription>
            Análise de pontos críticos nas auditorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditorias && auditorias.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm">
                <p>Com base nas {auditorias.length} auditorias realizadas, identificamos os seguintes padrões de problemas:</p>
              </div>
              
              <div className="space-y-3 mt-3">
                <h4 className="font-medium">Áreas que precisam de atenção:</h4>
                <div className="space-y-2">
                  {estatisticas.criticas > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">
                        {estatisticas.criticas} {estatisticas.criticas === 1 ? 'loja precisa' : 'lojas precisam'} de intervenção urgente
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">
                        Nenhuma loja em situação crítica
                      </span>
                    </div>
                  )}
                  
                  {estatisticas.melhorias > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">
                        {estatisticas.melhorias} {estatisticas.melhorias === 1 ? 'loja requer' : 'lojas requerem'} melhorias pontuais
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">
                        Nenhuma loja requer melhorias pontuais
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4">
                <p className="font-medium mb-1">Recomendação:</p>
                <p>
                  {estatisticas.criticas > 0 
                    ? 'Focar em treinamentos e intervenções nas lojas identificadas em situação crítica.'
                    : estatisticas.melhorias > 0
                    ? 'Implementar melhorias de padronização nas lojas que necessitam de ajustes.'
                    : 'Manter o padrão de qualidade e identificar melhores práticas para replicar nas demais lojas.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Realize mais auditorias para gerar análises de pontos críticos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
