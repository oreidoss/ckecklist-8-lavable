
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { Store, Calendar, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

// Types for our Supabase data
type Loja = Database['public']['Tables']['lojas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Database['public']['Tables']['usuarios']['Row'];
};

const Home: React.FC = () => {
  // Fetch stores with their audits
  const { 
    data: lojas, 
    isLoading: loadingLojas 
  } = useQuery({
    queryKey: ['lojas-with-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lojas')
        .select('*, auditorias(*, usuario:usuarios(*))');
      
      if (error) throw error;
      return data as (Loja & { auditorias: Auditoria[] })[];
    }
  });

  if (loadingLojas) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle 
          title="Lojas" 
          description=""
        />
        <Button asChild>
          <Link to="/nova-auditoria">
            <span className="mr-2">+</span>
            Nova Loja
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lojas?.map((loja) => {
          // Get the most recent audit for this store, if any
          const latestAudit = loja.auditorias?.sort((a, b) => 
            new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
          )[0];

          return (
            <Card key={loja.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-lg font-semibold">{loja.nome} {loja.numero}</h3>
                    </div>
                  </div>

                  {latestAudit && (
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(latestAudit.data || '').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Supervisor(a): {latestAudit.usuario?.nome || 'Não definido'}
                      </div>
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Gerente: {latestAudit.gerente || 'Não definido'}
                      </div>
                      {latestAudit.pontuacao_total !== undefined && (
                        <div className="text-success font-medium">
                          {latestAudit.pontuacao_total} pts
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {latestAudit && latestAudit.status !== 'concluido' && (
                      <Button variant="default" className="flex-1" asChild>
                        <Link to={`/checklist/${latestAudit.id}`}>
                          Continuar Checklist
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/nova-auditoria?loja=${loja.id}`}>
                        Nova Avaliação
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/relatorio/loja/${loja.id}`}>
                        Histórico
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
