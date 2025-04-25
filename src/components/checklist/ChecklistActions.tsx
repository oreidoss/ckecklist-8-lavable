
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Save, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const navigateToReport = () => {
    if (!auditoriaId) {
      console.error("[ERRO] Não é possível navegar para o relatório: auditoriaId não definido");
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

  const handleSaveClick = () => {
    console.log("[INFO] Botão Salvar clicado, iniciando salvamento...");
    if (!auditoriaId) {
      console.error("[ERRO] Tentativa de salvar sem auditoriaId");
      toast({
        title: "Erro ao salvar",
        description: "ID da auditoria não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    if (isSaving || isSendingEmail) {
      console.log("[AVISO] Operação em andamento, ignorando clique");
      return;
    }

    try {
      console.log("[INFO] Chamando saveAndNavigateHome");
      saveAndNavigateHome();
    } catch (error: any) {
      console.error("[ERRO] Exceção em handleSaveClick:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar salvar a auditoria.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-1">
      {isEditingActive && (
        <Button
          variant="default"
          size="sm"
          onClick={handleSaveClick}
          disabled={isSaving || isSendingEmail}
          className="flex-1 text-xs h-8"
          data-testid="save-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Salvando...
            </>
          ) : isSendingEmail ? (
            <>
              <Mail className="mr-1 h-3 w-3" />
              Enviando...
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
        disabled={isSaving || isSendingEmail}
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
