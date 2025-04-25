
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
  const { toast } = useToast();
  const { user } = useAuth();

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
    if (isSaving || !auditoriaId) return false;
    
    setIsSaving(true);
    
    try {
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      console.log("Calculando pontuação e salvando auditoria...");
      
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
      
      console.log("Dados da auditoria obtidos para email:", auditoria);
      
      // Calculate progress based on respostas
      const progresso = respostasExistentes.length > 0 ? 100 : 0;
      
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) {
        console.error("Erro ao atualizar auditoria:", error);
        throw error;
      }
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // Always try to send the report via email when user clicks save
      if (auditoria?.loja?.nome) {
        console.log("Enviando relatório por email...");
        await sendReportEmail(auditoria.loja.nome);
      } else {
        console.error("Não foi possível enviar email: nome da loja não encontrado");
        toast({
          title: "Alerta",
          description: "Não foi possível enviar o email: dados da loja incompletos.",
          variant: "destructive"
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar auditoria:', error);
      console.error('Stack trace do erro:', error.stack);
      
      toast({
        title: "Erro",
        description: "Não foi possível salvar as respostas: " + (error.message || "erro desconhecido"),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveAndNavigateHome, isSaving, setIsSaving, isSendingEmail, sendReportEmail };
};
