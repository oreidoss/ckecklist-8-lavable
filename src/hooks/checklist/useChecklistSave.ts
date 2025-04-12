
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
    if (!auditoriaId || !user) return false;
    
    setIsSendingEmail(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-report-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar email do relatório');
      }
      
      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Error sending report email:', error);
      toast({
        title: "Erro ao enviar email",
        description: "O relatório foi salvo, mas não foi possível enviar o email.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const saveAndNavigateHome = async (respostasExistentes: any[]) => {
    if (isSaving || !auditoriaId) return false;
    
    setIsSaving(true);
    
    try {
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      // Get loja information for the email
      const { data: auditoria, error: auditoriaError } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*)')
        .eq('id', auditoriaId)
        .single();
        
      if (auditoriaError) throw auditoriaError;
      
      // Calculate progress based on respostas
      const progresso = respostasExistentes.length > 0 ? 100 : 0;
      
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // If the audit is complete (100%), send the report via email
      if (progresso === 100 && auditoria?.loja?.nome) {
        await sendReportEmail(auditoria.loja.nome);
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
