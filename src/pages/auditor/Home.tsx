
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { LojaCard } from '@/components/auditor/LojaCard';
import { NewAuditDialog } from '@/components/auditor/NewAuditDialog';

// Types for our Supabase data
type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'] & {
  role?: string;
};
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

const Home: React.FC = () => {
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [selectedLoja, setSelectedLoja] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const openNewAuditDialog = (lojaId: string) => {
    setSelectedLoja(lojaId);
    setDialogOpen(true);
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
        {lojas?.map((loja) => (
          <LojaCard 
            key={loja.id}
            loja={loja}
            onNewAudit={openNewAuditDialog}
            isCreatingAudit={isCreatingAudit}
          />
        ))}
      </div>

      <NewAuditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuarios={usuarios}
        selectedLoja={selectedLoja}
        isCreatingAudit={isCreatingAudit}
        setIsCreatingAudit={setIsCreatingAudit}
      />
    </div>
  );
};

export default Home;
