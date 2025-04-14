
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
      console.log("Enviando e-mail do relatório com os dados:", {
        auditoriaId,
        lojaName,
        userEmail: user.email,
        userName: user.nome,
      });
      
      const response = await fetch(`https://plskhjrrwofdroicafnr.supabase.co/functions/v1/send-report-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsc2toanJyd29mZHJvaWNhZm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTI4ODcsImV4cCI6MjA1OTE2ODg4N30.lX-8Vx0xECgVRgpVtELFQUqcrU19KRwvvSR-_ObSZYQ`,
        },
        body: JSON.stringify({
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
        console.error("Resposta não-ok do servidor:", errorData);
        throw new Error(errorData.error || `Erro ao enviar email do relatório: ${response.status}`);
      }
      
      const responseData = await response.json().catch(() => ({}));
      console.log("Resposta do servidor:", responseData);
      
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
      const respostasContagem = respostasExistentes ? respostasExistentes.length : 0;
      const { count: perguntasCount, error: countError } = await supabase
        .from('perguntas')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Calculate progress percentage
      const progresso = perguntasCount ? Math.round((respostasContagem / perguntasCount) * 100) : 0;
      console.log(`Progresso calculado: ${progresso}% (${respostasContagem}/${perguntasCount})`);
      
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso >= 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // If the audit is complete (progresso >= 100%), send the report via email
      if (progresso >= 100 && auditoria?.loja?.nome) {
        console.log("Auditoria concluída, enviando relatório por email");
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
