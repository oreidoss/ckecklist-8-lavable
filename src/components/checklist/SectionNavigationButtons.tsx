
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SectionNavigationButtonsProps {
  isFirstSection: boolean;
  isLastSection: boolean;
  handlePreviousSection: () => void;
  handleNextSection: () => Promise<boolean> | void;
  hasUnansweredQuestions: () => boolean;
  saveResponses?: () => Promise<void>;
  showSaveButton?: boolean;
}

const SectionNavigationButtons: React.FC<SectionNavigationButtonsProps> = ({
  isFirstSection,
  isLastSection,
  handlePreviousSection,
  handleNextSection,
  hasUnansweredQuestions,
  saveResponses,
  showSaveButton = true
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const onNextSectionClick = async () => {
    if (isLastSection || isProcessing || isSaving) return;
    
    // Clear any previous errors
    setActionError(null);
    
    // Warn if questions are unanswered
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Existem perguntas não respondidas nesta seção. Você ainda pode avançar, mas a seção não será salva como completa.",
      });
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Navegando para próxima seção");
      
      // Chamar função de navegação
      if (typeof handleNextSection === 'function') {
        const result = handleNextSection();
        
        if (result instanceof Promise) {
          const success = await result;
          console.log(`Navegação para próxima seção ${success ? 'concluída' : 'falhou'}`);
          
          if (!success) {
            setActionError("Não foi possível navegar para a próxima seção. Tente novamente.");
          }
        } else {
          console.log("Função de navegação executada sem Promise");
        }
      } else {
        console.error("handleNextSection não é uma função");
        setActionError("Erro na função de navegação. Tente recarregar a página.");
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao navegar para próxima seção:", error);
      setActionError(`Erro: ${errorMessage}`);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onPreviousSectionClick = () => {
    if (isFirstSection || isProcessing || isSaving) return;
    
    // Clear any previous errors
    setActionError(null);
    
    console.log("Navegando para seção anterior");
    
    try {
      // Chamar função de navegação para a seção anterior
      if (typeof handlePreviousSection === 'function') {
        handlePreviousSection();
        console.log("Navegação para seção anterior concluída");
      } else {
        console.error("handlePreviousSection não é uma função");
        setActionError("Erro na função de navegação. Tente recarregar a página.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao navegar para seção anterior:", error);
      setActionError(`Erro: ${errorMessage}`);
    }
  };

  const onSaveClick = async () => {
    if (isSaving || !saveResponses) return;
    
    // Clear any previous errors
    setActionError(null);
    setIsSaving(true);
    
    try {
      await saveResponses();
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao salvar respostas:", error);
      setActionError(`Erro: ${errorMessage}`);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousSectionClick}
          disabled={isFirstSection || isProcessing || isSaving}
          className="flex-1 text-xs h-8"
        >
          <ArrowLeftCircle className="mr-1 h-3 w-3" />
          Anterior
        </Button>
        
        {showSaveButton && saveResponses && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveClick}
            disabled={isSaving}
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
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextSectionClick}
          disabled={isLastSection || isProcessing || isSaving}
          className="flex-1 text-xs h-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Próxima
              <ArrowRightCircle className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      
      {actionError && (
        <Alert variant="destructive" className="mt-2 p-2">
          <AlertDescription className="text-xs">{actionError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SectionNavigationButtons;
