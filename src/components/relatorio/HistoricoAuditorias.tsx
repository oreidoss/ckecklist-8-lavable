
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, FileText } from 'lucide-react';

interface HistoricoAuditoriasProps {
  auditorias: any[];
}

export const HistoricoAuditorias: React.FC<HistoricoAuditoriasProps> = ({ auditorias }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Auditorias</CardTitle>
        <CardDescription>Todas as auditorias realizadas nesta loja</CardDescription>
      </CardHeader>
      <CardContent>
        {auditorias && auditorias.length > 0 ? (
          <div className="space-y-4">
            {auditorias.map((auditoria) => (
              <Card key={auditoria.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">
                          {format(new Date(auditoria.data || ''), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Auditor: {auditoria.usuario?.nome || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${
                        auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                          ? `${auditoria.pontuacao_total.toFixed(1)} pts` 
                          : '0 pts'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/relatorio/${auditoria.id}`)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Nenhuma auditoria realizada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ainda não foram realizadas auditorias para esta loja.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
