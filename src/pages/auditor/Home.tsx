
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { 
  Store, 
  ClipboardCheck, 
  BarChart 
} from 'lucide-react';

// Types for our Supabase data
interface Loja {
  id: string;
  numero: string;
  nome: string;
}

interface Auditoria {
  id: string;
  loja_id: string;
  data: string;
  status: string;
  pontuacao_total: number;
  loja?: Loja;
}

const Home: React.FC = () => {
  // Fetch stores
  const { 
    data: lojas, 
    isLoading: loadingLojas 
  } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lojas').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent audits with store details
  const { 
    data: auditorias, 
    isLoading: loadingAuditorias 
  } = useQuery({
    queryKey: ['auditorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(numero, nome)')
        .order('data', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    }
  });

  if (loadingLojas || loadingAuditorias) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <PageTitle 
        title="Audit Flow Compass" 
        description="Gerencie suas auditorias de forma simples e eficiente"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stores Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="mr-2 h-6 w-6" />
              Lojas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {lojas?.map((loja) => (
                <Link 
                  key={loja.id} 
                  to={`/nova-auditoria?loja=${loja.id}`} 
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <span>{loja.nome} ({loja.numero})</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/lojas">
                Gerenciar Lojas
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Audits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-6 w-6" />
              Auditorias Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditorias?.length ? (
              <div className="space-y-4">
                {auditorias.map((auditoria) => (
                  <div 
                    key={auditoria.id} 
                    className="flex justify-between items-center border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">
                        {auditoria.loja?.nome} ({auditoria.loja?.numero})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(auditoria.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          auditoria.status === 'concluido' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {auditoria.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                      </span>
                      <Link to={`/relatorio/${auditoria.id}`}>
                        <Button size="sm" variant="outline">
                          Ver Relatório
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                Nenhuma auditoria recente
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/relatorios">
                <BarChart className="mr-2 h-4 w-4" />
                Todos os Relatórios
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home;
