
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Save, Mail, Loader2, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistActionsProps {
  auditoriaId: string | undefined;
  saveAndNavigateHome: () => void;
  isSaving: boolean;
  isEditingActive?: boolean;
  isSendingEmail?: boolean;
}

const ChecklistActions: React.FC<ChecklistActionsProps> = ({
  auditoriaId,
  saveAndNavigateHome,
  isSaving,
  isEditingActive = true,
  isSendingEmail = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const navigateToReport = () => {
    if (!auditoriaId) {
      console.error("[ERRO] auditoriaId não definido para navegação");
      toast({
        title: "Erro de navegação",
        description: "ID da auditoria não encontrado. Não é possível acessar o relatório.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[INFO] Navegando para relatório:", `/relatorio/${auditoriaId}`);
    navigate(`/relatorio/${auditoriaId}`);
  };

  const verifyConnection = async () => {
    try {
      setIsCheckingConnection(true);
      setConnectionError(false);
      
      console.log("[INFO] Verificando conexão com Supabase...");
      const { data, error } = await supabase.from('respostas').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error("[ERRO] Falha na conexão com Supabase:", error);
        setConnectionError(true);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("[INFO] Conexão com Supabase estabelecida com sucesso");
      return true;
    } catch (error) {
      console.error("[ERRO] Exceção ao verificar conexão:", error);
      setConnectionError(true);
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

  const handleSaveClick = async () => {
    if (!auditoriaId) {
      console.error("[ERRO] Tentativa de salvar sem auditoriaId");
      toast({
        title: "Erro ao salvar",
        description: "ID da auditoria não encontrado. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }
    
    if (isSaving || isSendingEmail || isCheckingConnection) {
      console.log("[AVISO] Operação em andamento, ignorando clique");
      return;
    }

    try {
      // Verificar conexão antes de salvar
      const isConnected = await verifyConnection();
      if (!isConnected) {
        console.log("[AVISO] Não foi possível salvar devido a problemas de conexão");
        return;
      }
      
      console.log("[INFO] Iniciando salvamento...");
      await saveAndNavigateHome();
      console.log("[SUCESSO] Salvamento concluído");
    } catch (error: any) {
      console.error("[ERRO] Falha ao salvar:", error);
      console.error("[ERRO] Stack trace:", error.stack);
      
      // Mensagem de erro mais específica baseada no tipo de erro
      let errorDescription = "Ocorreu um erro ao salvar. Verifique sua conexão e tente novamente.";
      
      if (error.message && error.message.includes("network")) {
        errorDescription = "Erro de rede. Verifique sua conexão com a internet.";
      } else if (error.code === "PGRST301") {
        errorDescription = "Tempo limite de conexão excedido. Tente novamente.";
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorDescription,
        variant: "destructive"
      });
    }
  };

  const isDisabled = isSaving || isSendingEmail || isCheckingConnection;
  const hasConnectionError = connectionError && !isCheckingConnection;

  return (
    <div className="flex gap-1">
      {isEditingActive && (
        <Button
          variant={hasConnectionError ? "destructive" : "default"}
          size="sm"
          onClick={handleSaveClick}
          disabled={isDisabled}
          className="flex-1 text-xs h-8"
          data-testid="save-button"
        >
          {isCheckingConnection ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Verificando...
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Salvando...
            </>
          ) : isSendingEmail ? (
            <>
              <Mail className="mr-1 h-3 w-3" />
              Enviando...
            </>
          ) : hasConnectionError ? (
            <>
              <WifiOff className="mr-1 h-3 w-3" />
              Sem conexão
            </>
          ) : (
            <>
              <Save className="mr-1 h-3 w-3" />
              Salvar
            </>
          )}
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={navigateToReport}
        disabled={isDisabled}
        className="flex-1 text-xs h-8"
        data-testid="report-button"
      >
        <FileText className="mr-1 h-3 w-3" />
        Relatório
      </Button>
    </div>
  );
};

export default ChecklistActions;
