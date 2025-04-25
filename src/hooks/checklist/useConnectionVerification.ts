
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionVerification = () => {
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();

  const verifyConnection = async (): Promise<boolean> => {
    try {
      setIsCheckingConnection(true);
      setIsConnected(true);
      
      console.log("[INFO] Verificando conexão com Supabase...");
      const startTime = performance.now();
      
      const { error } = await supabase.from('respostas').select('count', { count: 'exact', head: true });
      
      const endTime = performance.now();
      console.log(`[INFO] Tempo de resposta do Supabase: ${(endTime - startTime).toFixed(2)}ms`);
      
      if (error) {
        console.error("[ERRO] Falha na verificação de conexão:", error);
        setIsConnected(false);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("[INFO] Conexão com Supabase verificada com sucesso");
      return true;
    } catch (error) {
      console.error("[ERRO] Exceção ao verificar conexão:", error);
      setIsConnected(false);
      toast({
        title: "Erro de conexão",
        description: "Erro ao verificar conexão com o banco de dados.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  return {
    isCheckingConnection,
    isConnected,
    verifyConnection
  };
};
