
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Store, Calendar, User, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Types for our Supabase data
type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);

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

  // Fetch users for new audit
  const { 
    data: usuarios 
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) throw error;
      return data as Usuario[];
    }
  });

  const createNewAudit = async (lojaId: string) => {
    if (isCreatingAudit) return;
    setIsCreatingAudit(true);

    try {
      // Use the first user as default supervisor
      const defaultUser = usuarios && usuarios.length > 0 ? usuarios[0] : null;
      
      const { data, error } = await supabase
        .from('auditorias')
        .insert({
          loja_id: lojaId,
          usuario_id: defaultUser?.id,
          data: new Date().toISOString(),
          status: 'em_andamento',
          pontuacao_total: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Auditoria criada",
        description: "Nova auditoria iniciada com sucesso!",
      });
      
      // Navigate to the checklist
      navigate(`/checklist/${data.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAudit(false);
    }
  };

  if (loadingLojas) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#00bfa5]">Lojas</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {lojas?.map((loja) => {
          // Get the most recent audit for this store, if any
          const latestAudit = loja.auditorias?.sort((a, b) => 
            new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
          )[0];

          // Check if there's an ongoing audit
          const hasOngoingAudit = latestAudit && latestAudit.status !== 'concluido';

          return (
            <div key={loja.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-center">
                    <Store className="h-5 w-5 md:h-6 md:w-6 text-[#00bfa5] mr-2 md:mr-3" />
                    <h2 className="text-lg md:text-xl font-bold">{loja.nome}</h2>
                  </div>
                </div>

                {latestAudit && (
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
                    {latestAudit.data && (
                      <div className="flex items-center text-gray-600 text-sm md:text-base">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                        {new Date(latestAudit.data).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                      Supervisor(a): {latestAudit.supervisor || 'Não definido'}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                      Gerente: {latestAudit.gerente || 'Não definido'}
                    </div>
                    {latestAudit.pontuacao_total !== null && latestAudit.pontuacao_total !== undefined && (
                      <div className="flex items-center text-[#00c853] font-medium text-sm md:text-base">
                        <span className="inline-block w-4 h-4 md:w-5 md:h-5 mr-2">↗</span>
                        {latestAudit.pontuacao_total} pts
                      </div>
                    )}
                  </div>
                )}

                <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-2'}`}>
                  {hasOngoingAudit && (
                    <Button
                      className="bg-[#ffc107] hover:bg-[#ffb300] text-black text-xs md:text-sm"
                      asChild
                      size={isMobile ? "sm" : "default"}
                    >
                      <Link to={`/checklist/${latestAudit.id}`}>
                        Continuar
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant={!hasOngoingAudit ? "default" : "outline"}
                    className={`text-xs md:text-sm ${!hasOngoingAudit ? "bg-[#00bfa5] hover:bg-[#00a896]" : ""}`}
                    onClick={() => createNewAudit(loja.id)}
                    disabled={isCreatingAudit}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {!hasOngoingAudit ? "Avaliar" : "Nova"}
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    size={isMobile ? "sm" : "default"}
                    className="text-xs md:text-sm"
                  >
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
