
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { db, Auditoria } from "@/lib/db";
import { ClipboardCheck, FileText, Store } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AuditorHome: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>(db.getAuditorias());
  const navigate = useNavigate();
  const lojas = db.getLojas();

  // Obter as auditorias mais recentes (limitado a 5)
  const auditoriasRecentes = [...auditorias]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div>
      <PageTitle 
        title="Painel do Auditor" 
        description="Gerencie e inicie auditorias para as lojas cadastradas"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Nova Auditoria</CardTitle>
            <CardDescription>Iniciar um novo processo de auditoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <ClipboardCheck className="h-16 w-16 text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/nova-auditoria')}>
              Iniciar Auditoria
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Lojas Disponíveis</CardTitle>
            <CardDescription>Total de lojas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <div className="text-4xl font-bold text-primary">{lojas.length}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/nova-auditoria')}>
              Ver Lojas
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Auditorias Realizadas</CardTitle>
            <CardDescription>Total de auditorias concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <div className="text-4xl font-bold text-primary">{auditorias.length}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/admin/relatorios')}>
              Ver Relatórios
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Auditorias Recentes</h2>
      
      {auditoriasRecentes.length > 0 ? (
        <div className="space-y-4">
          {auditoriasRecentes.map((auditoria) => {
            const loja = lojas.find(l => l.id === auditoria.loja_id);
            return (
              <Card key={auditoria.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Store className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{loja?.nome || 'Loja não encontrada'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(auditoria.data), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        auditoria.pontuacao_total > 0 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {auditoria.pontuacao_total > 0 ? 'Aprovado' : 'Não aprovado'}
                      </span>
                      <Link to={`/relatorio/${auditoria.id}`}>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma auditoria realizada ainda.</p>
            <Button className="mt-4" onClick={() => navigate('/nova-auditoria')}>
              Iniciar Primeira Auditoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditorHome;
