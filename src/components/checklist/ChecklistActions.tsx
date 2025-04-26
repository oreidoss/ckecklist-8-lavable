
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Save, Mail, Loader2 } from 'lucide-react';

interface ChecklistActionsProps {
  auditoriaId: string | undefined;
  saveAndNavigateHome: () => void;
  isSaving: boolean;
  isEditingActive?: boolean;
  isSendingEmail?: boolean;
  reportRef?: React.RefObject<HTMLDivElement>;
  onSendEmail?: () => void;
}

const ChecklistActions: React.FC<ChecklistActionsProps> = ({
  auditoriaId,
  saveAndNavigateHome,
  isSaving,
  isEditingActive = true,
  isSendingEmail = false,
  onSendEmail
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-1">
      {isEditingActive && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={saveAndNavigateHome}
            disabled={isSaving || isSendingEmail}
            className="flex-1 text-xs h-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-1 h-3 w-3" />
                Salvar
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSendEmail}
            disabled={isSaving || isSendingEmail}
            className="flex-1 text-xs h-8"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-1 h-3 w-3" />
                Enviar Email
              </>
            )}
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/relatorio/${auditoriaId}`)}
        disabled={isSaving || isSendingEmail}
        className="flex-1 text-xs h-8"
      >
        <FileText className="mr-1 h-3 w-3" />
        Relatório
      </Button>
    </div>
  );
};

export default ChecklistActions;
