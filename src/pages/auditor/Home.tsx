
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { LojaCard } from '@/components/auditor/LojaCard';
import { NewAuditDialog } from '@/components/auditor/NewAuditDialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Fetch stores with their audits
  const { 
    data: lojas, 
    isLoading: loadingLojas,
    refetch: refetchLojas 
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
    data: usuarios,
    refetch: refetchUsuarios 
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) throw error;
      
      // Convert the role/function from the database to the role property for compatibility
      const enhancedUsers = data?.map(user => ({
        ...user,
        role: user.funcao
      })) || [];
      
      console.log("Usuario data loaded:", enhancedUsers);
      return enhancedUsers as Usuario[];
    }
  });

  // Check if supervisors/managers exist, if not suggest creating some
  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      const supervisores = usuarios.filter(u => 
        u.role === 'supervisor' || 
        u.funcao === 'supervisor' || 
        u.email?.toLowerCase().includes('supervisor') || 
        u.nome?.toLowerCase().includes('supervisor')
      );
      
      const gerentes = usuarios.filter(u => 
        u.role === 'gerente' || 
        u.funcao === 'gerente' || 
        u.email?.toLowerCase().includes('gerente') || 
        u.nome?.toLowerCase().includes('gerente')
      );

      if (supervisores.length === 0 && gerentes.length === 0) {
        toast({
          title: "Atenção",
          description: "Não foram encontrados usuários com função de supervisor ou gerente. Considere criar usuários com estas funções na área de Administração de Usuários.",
          variant: "destructive", // Changed from "warning" to "destructive" as the available options are "default" or "destructive"
          duration: 6000
        });
      } else {
        console.log("Supervisores encontrados:", supervisores.length);
        console.log("Gerentes encontrados:", gerentes.length);
      }
    }
  }, [usuarios, toast]);

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
