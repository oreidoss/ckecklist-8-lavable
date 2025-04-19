
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { LojaCard } from '@/components/auditor/LojaCard';
import { NewAuditDialog } from '@/components/auditor/NewAuditDialog';
import { useToast } from '@/hooks/use-toast';
import { Auditoria } from '@/lib/types';
import { Button } from "@/components/ui/button";

// Types for our Supabase data
type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'] & {
  role?: string;
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
        .select('*, auditorias(*, usuario:usuarios(*), respostas(*))');
      
      if (error) throw error;
      
      // Log the auditorias data to verify ongoing status
      data?.forEach((loja) => {
        console.log(`Loja ${loja.nome} auditorias:`, loja.auditorias);
        
        const inProgressAudits = loja.auditorias.filter(
          (audit: any) => audit.status === 'em_andamento'
        );
        
        if (inProgressAudits.length > 0) {
          console.log(`Loja ${loja.nome} has ${inProgressAudits.length} in-progress audits:`, inProgressAudits);
        }
      });
      
      // Enhance the data to ensure all auditorias have the necessary properties
      const enhancedData = data?.map(loja => {
        // Ensure each auditoria has a respostas array
        const enhancedAuditorias = loja.auditorias?.map((auditoria: any) => {
          // Calculate or set perguntas_count if not present
          if (!auditoria.perguntas_count) {
            const respostasLength = auditoria.respostas?.length || 0;
            auditoria.perguntas_count = respostasLength > 0 ? respostasLength : 20; // Default value if no responses yet
          }
          
          // Ensure respostas is always an array
          if (!auditoria.respostas) {
            auditoria.respostas = [];
          }
          
          return auditoria;
        }) || [];
        
        return {
          ...loja,
          auditorias: enhancedAuditorias
        };
      });
      
      return enhancedData as (Loja & { auditorias: Auditoria[] })[];
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
          variant: "destructive",
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
    <div className="container py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Selecione uma Loja</h1>
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto bg-[#4285f4] text-white hover:bg-[#3b78e7]"
        >
          Alternar Modo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
