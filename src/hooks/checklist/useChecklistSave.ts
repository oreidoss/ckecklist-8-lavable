
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
      const errorMsg = !auditoriaId 
        ? "ID da auditoria não fornecido" 
        : "Usuário não autenticado";
      
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    }
    
    setIsSendingEmail(true);
    
    try {
      console.log("Enviando e-mail do relatório com os dados:", {
        auditoriaId,
        lojaName,
        userEmail: user.email,
        userName: user.nome,
      });
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Variáveis de ambiente do Supabase não configuradas corretamente");
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-report-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          auditoriaId,
          lojaName,
          userEmail: user.email,
          userName: user.nome,
        }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Erro ${response.status}: ${response.statusText}` };
        }
        
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
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error('Error sending report email:', error);
      toast({
        title: "Erro ao enviar email",
        description: `O relatório foi salvo, mas não foi possível enviar o email: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const saveAndNavigateHome = async (respostasExistentes: any[]) => {
    if (isSaving) {
      toast({
        title: "Operação em andamento",
        description: "Aguarde o término do salvamento atual.",
      });
      return false;
    }
    
    if (!auditoriaId) {
      toast({
        title: "Erro",
        description: "ID da auditoria não encontrado. Tente recarregar a página.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSaving(true);
    
    try {
      let pontuacaoTotal = 0;
      
      if (!Array.isArray(respostasExistentes) || respostasExistentes.length === 0) {
        console.warn("Nenhuma resposta disponível para calcular a pontuação");
      } else {
        respostasExistentes.forEach(r => {
          if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
            const pontuacao = Number(r.pontuacao_obtida);
            if (!isNaN(pontuacao)) {
              pontuacaoTotal += pontuacao;
            } else {
              console.warn(`Pontuação inválida para resposta ID ${r.id}: ${r.pontuacao_obtida}`);
            }
          }
        });
      }
      
      // Get loja information for the email
      const { data: auditoria, error: auditoriaError } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*)')
        .eq('id', auditoriaId)
        .single();
        
      if (auditoriaError) {
        throw new Error(`Erro ao carregar dados da auditoria: ${auditoriaError.message}`);
      }
      
      if (!auditoria) {
        throw new Error("Auditoria não encontrada");
      }
      
      // Calculate progress based on respostas
      const respostasContagem = respostasExistentes ? respostasExistentes.length : 0;
      
      const { count: perguntasCount, error: countError } = await supabase
        .from('perguntas')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(`Erro ao contar perguntas: ${countError.message}`);
      }
      
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
        
      if (error) {
        throw new Error(`Erro ao atualizar auditoria: ${error.message}`);
      }
      
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
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error('Error saving audit:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar as respostas: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveAndNavigateHome, isSaving, setIsSaving, isSendingEmail };
};
