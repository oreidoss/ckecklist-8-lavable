
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
import { Store, Calendar, User } from 'lucide-react';

interface InformacoesGeraisProps {
  auditoria: any;
}

export const InformacoesGerais: React.FC<InformacoesGeraisProps> = ({ auditoria }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>Detalhes da auditoria realizada</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Loja</div>
          <div className="flex items-center text-lg font-bold">
            <Store className="h-5 w-5 mr-2 text-primary" />
            {auditoria.loja ? `${auditoria.loja.numero} - ${auditoria.loja.nome}` : 'N/A'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Data da Auditoria</div>
          <div className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            {auditoria.data 
              ? format(new Date(auditoria.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
              : 'N/A'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Auditor</div>
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            {auditoria.usuario?.nome || 'N/A'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Pontuação Total</div>
          <div className={`text-xl font-bold ${auditoria.pontuacao_total && auditoria.pontuacao_total > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
              ? `${auditoria.pontuacao_total.toFixed(1)} pontos` 
              : '0 pontos'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Supervisor(a)</div>
          <div className="flex items-center bg-gray-50 p-2 rounded-md border">
            <User className="h-5 w-5 mr-2 text-primary" />
            {auditoria.supervisor || 'Não definido'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Gerente</div>
          <div className="flex items-center bg-gray-50 p-2 rounded-md border">
            <User className="h-5 w-5 mr-2 text-primary" />
            {auditoria.gerente || 'Não definido'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
