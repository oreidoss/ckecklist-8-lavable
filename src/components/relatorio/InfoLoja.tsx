
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Store, Clock, FileText, Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface InfoLojaProps {
  loja: any;
  auditorias: any[];
}

export const InfoLoja: React.FC<InfoLojaProps> = ({ loja, auditorias }) => {
  // Definir a meta total de pontos possíveis (111 conforme especificado)
  const metaTotal = 111;
  
  // Calcular média de pontuação
  const mediaPontuacao = auditorias && auditorias.length > 0
    ? (auditorias.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0) / auditorias.length).toFixed(1)
    : '0.0';

  // Calcular percentual médio da meta
  const percentualMedio = auditorias && auditorias.length > 0
    ? (parseFloat(mediaPontuacao) / metaTotal * 100).toFixed(1)
    : '0.0';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Loja</CardTitle>
        <CardDescription>Detalhes da loja e estatísticas gerais</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-4">
            <Store className="h-6 w-6 text-primary mr-3" />
            <h3 className="text-xl font-bold">
              {loja.numero} - {loja.nome}
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Última auditoria: {
                auditorias && auditorias.length > 0
                  ? format(new Date(auditorias[0].data || ''), "dd/MM/yyyy", { locale: ptBR })
                  : 'Nunca'
              }
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Total de auditorias: {auditorias?.length || 0}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center">
            Pontuação Média 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="ml-1">
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Pontuação média de todas as auditorias. 
                    A meta total possível é de {metaTotal} pontos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <div className="text-3xl font-bold text-primary">
            {mediaPontuacao} <span className="text-sm font-normal text-gray-500">de {metaTotal}</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="text-sm text-muted-foreground">
              {percentualMedio}% da meta
            </div>
            <div className="ml-2 flex-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${Math.min(parseFloat(percentualMedio), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
