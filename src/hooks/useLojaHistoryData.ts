
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLojaHistoryData() {
  const { lojaId } = useParams();
  
  const {
    data: auditoriasPorLoja,
    isLoading: loadingAuditoriasPorLoja,
    error
  } = useQuery({
    queryKey: ['auditorias-por-loja', lojaId],
    queryFn: async () => {
      if (!lojaId) return null;
      
      console.log("Fetching history for loja ID:", lojaId);

      const { data: loja, error: lojaError } = await supabase
        .from('lojas')
        .select('*')
        .eq('id', lojaId)
        .single();
      
      if (lojaError) {
        console.error("Error fetching loja:", lojaError);
        throw lojaError;
      }
      
      const { data: auditorias, error: auditoriasError } = await supabase
        .from('auditorias')
        .select('*, usuario:usuarios(*), respostas(*)')
        .eq('loja_id', lojaId)
        .order('data', { ascending: false });
      
      if (auditoriasError) {
        console.error("Error fetching auditorias:", auditoriasError);
        throw auditoriasError;
      }
      
      console.log("Loja data:", loja);
      console.log("Auditorias for loja:", auditorias);
      
      return { loja, auditorias };
    },
    enabled: !!lojaId
  });

  return {
    auditoriasPorLoja,
    loadingAuditoriasPorLoja,
    error
  };
}
