
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generatePdfBase64 } from '@/utils/pdf';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to manage saving checklist data
 */
export const useChecklistSave = (auditoriaId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const sendReportEmail = async (lojaName: string, reportRef: React.RefObject<HTMLDivElement>) => {
    if (!auditoriaId || !user || !reportRef.current) {
      console.error("Missing required data for email:", { auditoriaId, user, reportRef });
      toast({
        title: "Erro de dados",
        description: "Faltam dados necessários para enviar o email",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSendingEmail(true);
    
    try {
      // Generate PDF as base64
      const pdfBase64 = await generatePdfBase64(reportRef.current);
      
      console.log("Iniciando envio de email...");
      
      const { error } = await supabase.functions.invoke('send-report-email', {
        body: {
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
          pdfBase64
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email do relatório: " + (error.message || "erro desconhecido"),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const saveAndNavigateHome = async (
    respostasExistentes: any[], 
    supervisorSignature?: string, 
    gerenteSignature?: string
  ) => {
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
      
      // Prepare update data
      const updateData: any = { 
        pontuacao_total: pontuacaoTotal,
        status: progresso === 100 ? 'concluido' : 'em_andamento'
      };

      // Add signatures if provided
      if (supervisorSignature) {
        updateData.assinatura_supervisor = supervisorSignature;
      }
      if (gerenteSignature) {
        updateData.assinatura_gerente = gerenteSignature;
      }
      
      const { error: updateError } = await supabase
        .from('auditorias')
        .update(updateData)
        .eq('id', auditoriaId);
        
      if (updateError) {
        console.error("Erro ao atualizar auditoria:", updateError);
        throw updateError;
      }
      
      console.log("Auditoria atualizada com sucesso");
      
      const successMessage = supervisorSignature && gerenteSignature 
        ? "Auditoria finalizada com assinaturas digitais!"
        : "Todas as respostas foram salvas com sucesso!";
      
      toast({
        title: "Auditoria salva",
        description: successMessage,
      });
      
      // Navigate to home after successful save
      navigate('/');
      
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
    setIsSendingEmail,
    sendReportEmail 
  };
};
