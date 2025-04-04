
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';

interface ChecklistActionsProps {
  auditoriaId: string | undefined;
  saveAndNavigateHome: () => void;
  isSaving: boolean;
}

const ChecklistActions: React.FC<ChecklistActionsProps> = ({
  auditoriaId,
  saveAndNavigateHome,
  isSaving
}) => {
  const navigate = useNavigate();

  const navigateToReport = () => {
    if (!auditoriaId) return;
    navigate(`/relatorio/${auditoriaId}`);
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="default"
        size="sm"
        onClick={saveAndNavigateHome}
        disabled={isSaving}
        className="flex-1 text-xs h-8"
      >
        Salvar
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={navigateToReport}
        disabled={isSaving}
        className="flex-1 text-xs h-8"
      >
        <FileText className="mr-1 h-3 w-3" />
        Relatório
      </Button>
    </div>
  );
};

export default ChecklistActions;
