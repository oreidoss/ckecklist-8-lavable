
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  
  const onNextSectionClick = async () => {
    if (isLastSection || isProcessing) return;
    
    // Warn if questions are unanswered
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Existem perguntas não respondidas nesta seção. Você ainda pode avançar, mas a seção não será salva como completa.",
      });
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Navegando para próxima seção com salvamento");
      
      // Check if handleNextSection is a function that returns a Promise
      if (typeof handleNextSection === 'function') {
        const result = handleNextSection();
        
        if (result instanceof Promise) {
          // Wait for the Promise to resolve
          const success = await result;
          console.log("Resultado da navegação:", success);
          
          if (!success) {
            throw new Error("Falha ao navegar para próxima seção");
          }
        } else {
          // Function doesn't return a Promise, just call it
          console.log("Função de navegação não retorna Promise, chamando diretamente");
        }
      }
      
    } catch (error) {
      console.error("Erro ao navegar para próxima seção:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSaveClick = async () => {
    if (isSaving || !saveResponses) return;
    
    setIsSaving(true);
    
    try {
      await saveResponses();
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
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
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousSection}
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
  );
};

export default SectionNavigationButtons;
