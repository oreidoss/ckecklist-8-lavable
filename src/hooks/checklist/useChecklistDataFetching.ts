
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching all the data needed for a checklist page
 */
export const useChecklistDataFetching = (auditoriaId: string | undefined) => {
  // User-editable fields with their states
  const [supervisor, setSupervisor] = useState('');
  const [gerente, setGerente] = useState('');
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [isEditingGerente, setIsEditingGerente] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const { toast } = useToast();
  
  // Generic error handler for queries
  const handleQueryError = (error: unknown, entityName: string) => {
    console.error(`Error fetching ${entityName}:`, error);
    toast({
      title: `Erro ao carregar ${entityName}`,
      description: error instanceof Error ? error.message : `Não foi possível carregar os dados de ${entityName}`,
      variant: "destructive"
    });
  };

  // Fetch usuarios
  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        handleQueryError(error, "usuários");
        return [];
      }
    }
  });
  
  // Fetch auditoria details
  const { data: auditoria, isLoading: loadingAuditoria, refetch: refetchAuditoria } = useQuery({
    queryKey: ['auditoria', auditoriaId],
    queryFn: async () => {
      try {
        if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
        
        const { data, error } = await supabase
          .from('auditorias')
          .select('*, loja:lojas(*), usuario:usuarios(*)')
          .eq('id', auditoriaId)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleQueryError(error, "auditoria");
        return null;
      }
    },
    meta: {
      onSuccess: (data) => {
        if (data) {
          setSupervisor(data.supervisor || 'Roberto Alves');
          setGerente(data.gerente || 'Patricia');
        }
      }
    },
    retry: 1 // Retry failed query once
  });
  
  // Fetch secoes
  const { data: secoes, isLoading: loadingSecoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('secoes')
          .select('*')
          .order('id');
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleQueryError(error, "seções");
        return [];
      }
    }
  });
  
  // Fetch perguntas
  const { data: perguntas, isLoading: loadingPerguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('perguntas')
          .select('*')
          .order('secao_id, id');
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleQueryError(error, "perguntas");
        return [];
      }
    }
  });
  
  // Fetch existing respostas
  const { data: respostasExistentes, isLoading: loadingRespostas } = useQuery({
    queryKey: ['respostas', auditoriaId],
    queryFn: async () => {
      try {
        if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
        
        const { data, error } = await supabase
          .from('respostas')
          .select('*')
          .eq('auditoria_id', auditoriaId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        handleQueryError(error, "respostas existentes");
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 60000 // 1 minute
  });

  // Overall loading state
  const isLoading = loadingAuditoria || loadingUsuarios || loadingSecoes || loadingPerguntas || loadingRespostas;

  return {
    // Data
    usuarios,
    auditoria,
    secoes,
    perguntas,
    respostasExistentes,
    
    // User-editable fields
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    currentDate,
    
    // Loading state
    isLoading,
    
    // Setters and actions
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    refetchAuditoria
  };
};
