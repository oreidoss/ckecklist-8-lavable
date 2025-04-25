
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
      console.log("Iniciando envio de email...", {
        auditoriaId,
        lojaName,
        userEmail: user.email,
        userName: user.nome,
      });
      
      // Preparando payload para envio
      const payload = {
        auditoriaId,
        lojaName,
        userEmail: user.email,
        userName: user.nome,
      };
      
      console.log("Chamando função send-report-email com payload:", JSON.stringify(payload));
      
      // Verificando URL da função
      const functionUrl = await supabase.functions.getUrl('send-report-email');
      console.log("URL da função Edge:", functionUrl);
      
      const response = await supabase.functions.invoke('send-report-email', {
        body: payload
      });
      
      console.log("Resposta completa da função send-report-email:", JSON.stringify(response));
      
      if (response.error) {
        console.error("Erro retornado pela função:", response.error);
        throw new Error(response.error.message || 'Erro ao enviar email do relatório');
      }
      
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

  const saveAndNavigateHome = async (respostasExistentes: any[]) => {
    if (isSaving || !auditoriaId) {
      console.log("Não pode salvar:", { isSaving, auditoriaId });
      return false;
    }
    
    setIsSaving(true);
    console.log("Iniciando saveAndNavigateHome para auditoria:", auditoriaId);
    
    try {
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      console.log("Calculando pontuação total:", pontuacaoTotal);
      
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
      
      const progresso = respostasExistentes.length > 0 ? 100 : 0;
      
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

  return { 
    saveAndNavigateHome, 
    isSaving, 
    setIsSaving, 
    isSendingEmail,
    sendReportEmail 
  };
};
