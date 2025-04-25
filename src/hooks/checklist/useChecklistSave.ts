
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage saving checklist data
 */
export const useChecklistSave = (auditoriaId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Verificar conexão com Supabase
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log("[INFO] Verificando conexão com o banco de dados...");
      const startTime = performance.now();
      
      const { error } = await supabase.from('auditorias').select('count', { count: 'exact', head: true });
      
      const endTime = performance.now();
      console.log(`[INFO] Tempo de resposta do Supabase: ${(endTime - startTime).toFixed(2)}ms`);
      
      if (error) {
        console.error("[ERRO] Falha na verificação de conexão:", error);
        setIsConnected(false);
        toast({
          title: "Erro de conexão",
          description: "Erro ao verificar conexão com o banco de dados.",
          variant: "destructive"
        });
        return false;
      }
      
      setIsConnected(true);
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
    }
  };

  /**
   * Send report via email
   */
  const sendReportEmail = async (lojaName: string) => {
    if (!auditoriaId || !user) {
      console.error("Missing required data for email:", { auditoriaId, user });
      toast({
        title: "Erro de dados",
        description: "Faltam dados necessários para enviar o email (auditoriaId ou usuário)",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSendingEmail(true);
    
    try {
      // Verificar conexão antes de enviar email
      const connectionOk = await checkConnection();
      if (!connectionOk) {
        return false;
      }
      
      console.log("Iniciando processo de envio de email...", {
        auditoriaId,
        lojaName,
        userEmail: user.email,
        userName: user.nome,
      });
      
      // Teste de log antes da chamada
      console.log("Chamando edge function send-report-email com URL completa:", 
        "https://plskhjrrwofdroicafnr.supabase.co/functions/v1/send-report-email");
      
      const response = await supabase.functions.invoke('send-report-email', {
        body: {
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
        },
      });
      
      console.log("Resposta recebida da API de email:", response);
      
      if (response.error) {
        console.error("Erro na resposta da edge function:", response.error);
        throw new Error(response.error.message || 'Erro ao enviar email do relatório');
      }
      
      console.log("Email enviado com sucesso:", response.data);
      
      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro detalhado ao enviar email:', error);
      console.error('Stack trace do erro:', error.stack);
      
      toast({
        title: "Erro ao enviar email",
        description: error.message || "O relatório foi salvo, mas não foi possível enviar o email.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  /**
   * Save checklist data and navigate home
   */
  const saveAndNavigateHome = async (respostasExistentes: any[]) => {
    if (isSaving || !auditoriaId) {
      console.log("Não pode salvar:", { isSaving, auditoriaId });
      return false;
    }
    
    setIsSaving(true);
    console.log("Iniciando saveAndNavigateHome para auditoria:", auditoriaId);
    
    try {
      // Verificar conexão antes de salvar
      const connectionOk = await checkConnection();
      if (!connectionOk) {
        console.error("Não foi possível salvar devido a problemas de conexão");
        toast({
          title: "Erro ao salvar",
          description: "Erro ao verificar conexão com o banco de dados.",
          variant: "destructive"
        });
        return false;
      }
      
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      console.log("Calculando pontuação total:", pontuacaoTotal);
      
      // Get loja information for the email
      const { data: auditoria, error: auditoriaError } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*)')
        .eq('id', auditoriaId)
        .single();
        
      if (auditoriaError) {
        console.error("Erro ao buscar dados da auditoria:", auditoriaError);
        throw auditoriaError;
      }
      
      console.log("Dados da auditoria obtidos:", auditoria);
      
      // Calculate progress based on respostas
      const progresso = respostasExistentes.length > 0 ? 100 : 0;
      
      // Update auditoria
      const { error: updateError } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (updateError) {
        console.error("Erro ao atualizar auditoria:", updateError);
        throw updateError;
      }
      
      console.log("Auditoria atualizada com sucesso");
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // Try to send email report
      if (auditoria?.loja?.nome) {
        console.log("Tentando enviar relatório por email...");
        await sendReportEmail(auditoria.loja.nome);
      } else {
        console.error("Não foi possível enviar email: dados da loja incompletos");
        toast({
          title: "Alerta",
          description: "Não foi possível enviar o email: dados da loja incompletos.",
          variant: "destructive"
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro detalhado ao salvar auditoria:', error);
      console.error('Stack trace do erro:', error.stack);
      
      let errorMessage = "Não foi possível salvar as respostas: " + (error.message || "erro desconhecido");
      
      // Determinar se é um erro de conexão
      if (error.message && (
          error.message.includes('network') || 
          error.message.includes('fetch') || 
          error.message.includes('timeout') ||
          error.message.includes('conexão')
        )) {
        errorMessage = "Erro de conexão com o banco de dados. Verifique sua internet e tente novamente.";
        setIsConnected(false);
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    saveAndNavigateHome, 
    isSaving, 
    setIsSaving, 
    isSendingEmail,
    isConnected,
    checkConnection,
    sendReportEmail 
  };
};
