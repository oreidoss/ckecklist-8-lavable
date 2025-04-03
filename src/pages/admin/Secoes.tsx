
import React from 'react';
import { PageTitle } from "@/components/PageTitle";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { AddSectionDialog } from '@/components/admin/secoes/AddSectionDialog';
import { SectionCard } from '@/components/admin/secoes/SectionCard';
import { LojasCard } from '@/components/admin/secoes/LojasCard';
import { UsuariosCard } from '@/components/admin/secoes/UsuariosCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSecoes: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch data using React Query with better error handling
  const { 
    data: secoes = [], 
    isLoading: isLoadingSecoes, 
    refetch: refetchSecoes 
  } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('secoes').select('*');
      if (error) {
        console.error("Error fetching secoes:", error);
        toast({
          title: "Erro ao carregar seções",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data || [];
    },
  });
  
  const { 
    data: lojas = [], 
    isLoading: isLoadingLojas,
    refetch: refetchLojas
  } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lojas').select('*');
      if (error) {
        console.error("Error fetching lojas:", error);
        toast({
          title: "Erro ao carregar lojas",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data || [];
    },
  });
  
  const { 
    data: perguntas = [], 
    isLoading: isLoadingPerguntas,
    refetch: refetchPerguntas 
  } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perguntas').select('*');
      if (error) {
        console.error("Error fetching perguntas:", error);
        toast({
          title: "Erro ao carregar perguntas",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data || [];
    },
  });

  const { 
    data: usuarios = [], 
    isLoading: isLoadingUsuarios,
    refetch: refetchUsuarios
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) {
        console.error("Error fetching usuarios:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data || [];
    },
  });
  
  const refreshAllData = () => {
    refetchSecoes();
    refetchLojas();
    refetchPerguntas();
    refetchUsuarios();
    toast({
      title: "Dados atualizados",
      description: "Todos os dados foram atualizados com sucesso."
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageTitle 
          title="Gerenciamento de Seções" 
          description="Adicione, edite e remova seções do checklist"
        />
        <Button variant="outline" onClick={refreshAllData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar dados
        </Button>
      </div>
      
      <div className="flex justify-end mb-6">
        <AddSectionDialog />
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>
            Visão geral dos dados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Seções</p>
              <h3 className="text-2xl font-bold">{isLoadingSecoes ? '...' : secoes.length}</h3>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Perguntas</p>
              <h3 className="text-2xl font-bold">{isLoadingPerguntas ? '...' : perguntas.length}</h3>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Lojas</p>
              <h3 className="text-2xl font-bold">{isLoadingLojas ? '...' : lojas.length}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SectionCard 
        secoes={secoes} 
        isLoading={isLoadingSecoes} 
        perguntas={perguntas} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <LojasCard lojas={lojas} isLoading={isLoadingLojas} />
        <UsuariosCard usuarios={usuarios} isLoading={isLoadingUsuarios} />
      </div>
    </div>
  );
};

export default AdminSecoes;
