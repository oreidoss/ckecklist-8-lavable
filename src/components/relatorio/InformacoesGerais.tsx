
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
import { Store, Calendar, User, Target, Info } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InformacoesGeraisProps {
  auditoria: any;
}

export const InformacoesGerais: React.FC<InformacoesGeraisProps> = ({ auditoria }) => {
  // Calculate total questions
  const totalPerguntas = auditoria.respostas?.length || 0;
  
  // Calculate goal (total questions - meta should be equal to total)
  const meta = totalPerguntas;
  
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
            {auditoria.loja ? auditoria.loja.nome : 'N/A'}
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
          <div className="flex items-center justify-between">
            <div className={`text-xl font-bold ${auditoria.pontuacao_total && auditoria.pontuacao_total > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                ? `${auditoria.pontuacao_total.toFixed(1)} pontos` 
                : '0 pontos'}
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md border border-blue-200 cursor-help">
                  <Target className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Meta: {meta} pontos
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Detalhes da Pontuação</h4>
                  <div className="text-sm">
                    <p className="mb-2">Informações detalhadas sobre o progresso da auditoria:</p>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-2 rounded-md">
                      <div>
                        <div className="text-xs text-muted-foreground">Pontuação Atual</div>
                        <div className="font-medium">
                          {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                            ? `${auditoria.pontuacao_total.toFixed(1)}` 
                            : '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Meta Total</div>
                        <div className="font-medium">{meta}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Progresso</div>
                        <div className="font-medium">
                          {auditoria.pontuacao_total && meta 
                            ? `${Math.round((auditoria.pontuacao_total / meta) * 100)}%` 
                            : '0%'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Restante</div>
                        <div className="font-medium">
                          {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                            ? `${(meta - auditoria.pontuacao_total).toFixed(1)}` 
                            : meta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="bg-gray-50 p-2 rounded-md text-sm border">
            <span className="font-medium text-gray-700">Total de Perguntas:</span> {totalPerguntas}
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
