
import React from 'react';
import { PageTitle } from "@/components/PageTitle";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { AddSectionDialog } from '@/components/admin/secoes/AddSectionDialog';
import { SectionCard } from '@/components/admin/secoes/SectionCard';
import { LojasCard } from '@/components/admin/secoes/LojasCard';
import { UsuariosCard } from '@/components/admin/secoes/UsuariosCard';

const AdminSecoes: React.FC = () => {
  // Fetch data using React Query
  const { data: secoes = [], isLoading: isLoadingSecoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('secoes').select('*');
      if (error) throw error;
      return data;
    },
  });
  
  const { data: lojas = [] } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lojas').select('*');
      if (error) throw error;
      return data;
    },
  });
  
  const { data: perguntas = [] } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perguntas').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) throw error;
      return data;
    },
  });
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Seções" 
        description="Adicione, edite e remova seções do checklist"
      />
      
      <div className="flex justify-end mb-6">
        <AddSectionDialog />
      </div>
      
      <SectionCard 
        secoes={secoes} 
        isLoading={isLoadingSecoes} 
        perguntas={perguntas} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <LojasCard lojas={lojas} />
        <UsuariosCard usuarios={usuarios} />
      </div>
    </div>
  );
};

export default AdminSecoes;
