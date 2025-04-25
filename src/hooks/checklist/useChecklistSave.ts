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
      return false;
    }
    
    setIsSendingEmail(true);
    
    try {
      console.log("Starting email send process...");
      
      const response = await supabase.functions.invoke('send-report-email', {
        body: {
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
        },
      });
      
      console.log("Email API response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar email do relatório');
      }
      
      console.log("Email send success response:", response.data);
      
      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending report email:', error);
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
      
      console.log("Calculating score and saving audit...");
      
      // Get loja information for the email
      const { data: auditoria, error: auditoriaError } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*)')
        .eq('id', auditoriaId)
        .single();
        
      if (auditoriaError) {
        console.error("Error fetching audit:", auditoriaError);
        throw auditoriaError;
      }
      
      console.log("Fetched audit data for email:", auditoria);
      
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
        console.error("Error updating audit:", error);
        throw error;
      }
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // Always try to send the report via email when user clicks save
      if (auditoria?.loja?.nome) {
        console.log("Sending email report...");
        await sendReportEmail(auditoria.loja.nome);
      } else {
        console.error("Cannot send email: missing loja name");
      }
      
      return true;
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as respostas.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveAndNavigateHome, isSaving, setIsSaving, isSendingEmail };
};
