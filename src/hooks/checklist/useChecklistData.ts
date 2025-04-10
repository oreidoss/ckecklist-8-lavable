
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Secao = Database['public']['Tables']['secoes']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];
type Resposta = Database['public']['Tables']['respostas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

export const useChecklistData = (auditoriaId: string | undefined) => {
  const [supervisor, setSupervisor] = useState('');
  const [gerente, setGerente] = useState('');
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [isEditingGerente, setIsEditingGerente] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('pt-BR'));
  }, []);

  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      console.log('Fetching usuarios...');
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      
      if (error) {
        console.error('Error fetching usuarios:', error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  const { data: auditoria, isLoading: loadingAuditoria, refetch: refetchAuditoria } = useQuery({
    queryKey: ['auditoria', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*)')
        .eq('id', auditoriaId)
        .single();
      
      if (error) throw error;
      console.log("Fetched auditoria:", data);
      return data as Auditoria;
    },
    meta: {
      onSuccess: (data) => {
        if (data) {
          setSupervisor(data.supervisor || '');
          setGerente(data.gerente || '');
        }
      }
    }
  });
  
  const { data: secoes, isLoading: loadingSecoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as Secao[];
    }
  });
  
  const { data: perguntas, isLoading: loadingPerguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .order('secao_id, id');
      
      if (error) throw error;
      return data as Pergunta[];
    }
  });
  
  // Use staleTime: 0 to ensure we always get fresh data when returning to the page
  const { data: respostasExistentes, isLoading: loadingRespostas, refetch: refetchRespostas } = useQuery({
    queryKey: ['respostas', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
      
      console.log(`Buscando respostas para auditoria: ${auditoriaId}`);
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
      
      if (error) {
        console.error("Erro ao buscar respostas:", error);
        throw error;
      }
      
      console.log(`Encontradas ${data?.length || 0} respostas para auditoria ${auditoriaId}`);
      return data as Resposta[];
    },
    staleTime: 0, // Always refetch when query mounts
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true // Also refetch on window focus
  });

  const isLoading = loadingAuditoria || loadingUsuarios || loadingSecoes || loadingPerguntas || loadingRespostas;

  return {
    usuarios,
    auditoria,
    secoes,
    perguntas,
    respostasExistentes,
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    currentDate,
    isLoading,
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    refetchAuditoria,
    refetchRespostas
  };
};
