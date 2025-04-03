
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pontuação Média Geral</h3>
            <div className="flex items-center">
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${
                      estatisticas.total > 0 
                        ? Math.min(
                            Math.max(
                              (estatisticas.media + 10) * 5, 
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
                {estatisticas.media}
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
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">
                      {estatisticas.criticas > 0 
                        ? `${estatisticas.criticas} ${estatisticas.criticas === 1 ? 'loja precisa' : 'lojas precisam'} de intervenção urgente`
                        : 'Nenhuma loja em situação crítica'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">
                      {estatisticas.melhorias} {estatisticas.melhorias === 1 ? 'loja requer' : 'lojas requerem'} melhorias pontuais
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4">
                <p className="font-medium mb-1">Recomendação:</p>
                <p>
                  {estatisticas.criticas > 0 
                    ? 'Focar em treinamentos e intervenções nas lojas identificadas em situação crítica.'
                    : estatisticas.melhorias > estatisticas.aprovadas
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
