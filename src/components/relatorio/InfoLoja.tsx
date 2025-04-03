
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
import { Store, Clock, FileText } from 'lucide-react';

interface InfoLojaProps {
  loja: any;
  auditorias: any[];
}

export const InfoLoja: React.FC<InfoLojaProps> = ({ loja, auditorias }) => {
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
          <h3 className="text-base font-medium mb-3">Pontuação Média</h3>
          <div className="text-3xl font-bold text-primary">
            {auditorias && auditorias.length > 0
              ? (auditorias.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0) / 
                 auditorias.length).toFixed(1)
              : '0.0'
            }
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Média baseada em todas as auditorias realizadas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
