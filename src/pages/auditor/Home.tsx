
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#00bfa5]">Lojas</h1>
        <Button asChild className="bg-[#00bfa5] hover:bg-[#00a896]">
          <Link to="/nova-auditoria" className="flex items-center">
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

          // Check if there's an ongoing audit
          const hasOngoingAudit = latestAudit && latestAudit.status !== 'concluido';

          return (
            <div key={loja.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Store className="h-6 w-6 text-[#00bfa5] mr-3" />
                    <h2 className="text-xl font-bold">{loja.nome} {loja.numero}</h2>
                  </div>
                </div>

                {latestAudit && (
                  <div className="space-y-3 mb-5">
                    {latestAudit.data && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                        {new Date(latestAudit.data).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      Supervisor(a): {latestAudit.usuario?.nome || 'Não definido'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      Gerente: {latestAudit.gerente || 'Não definido'}
                    </div>
                    {latestAudit.pontuacao_total !== null && latestAudit.pontuacao_total !== undefined && (
                      <div className="flex items-center text-[#00c853] font-medium">
                        <span className="inline-block w-5 h-5 mr-2">↗</span>
                        {latestAudit.pontuacao_total} pts
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {hasOngoingAudit && (
                    <Button
                      className="bg-[#ffc107] hover:bg-[#ffb300] text-black"
                      asChild
                    >
                      <Link to={`/checklist/${latestAudit.id}`}>
                        Continuar Checklist
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant={!hasOngoingAudit ? "default" : "outline"}
                    className={!hasOngoingAudit ? "bg-[#00bfa5] hover:bg-[#00a896]" : ""}
                    asChild
                  >
                    <Link to={`/nova-auditoria?loja=${loja.id}`}>
                      {!hasOngoingAudit ? "Avaliar" : "Nova Avaliação"}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/relatorio/loja/${loja.id}`}>
                      Histórico
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
