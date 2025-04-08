
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SectionNavigationButtonsProps {
  isFirstSection: boolean;
  isLastSection: boolean;
  handlePreviousSection: () => void;
  handleNextSection: () => void;
  hasUnansweredQuestions: () => boolean;
  saveResponses?: () => Promise<void>;
}

const SectionNavigationButtons: React.FC<SectionNavigationButtonsProps> = ({
  isFirstSection,
  isLastSection,
  handlePreviousSection,
  handleNextSection,
  hasUnansweredQuestions,
  saveResponses
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const onNextSectionClick = async () => {
    if (isLastSection || isProcessing) return;
    
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Existem perguntas não respondidas nesta seção. Você ainda pode avançar, mas a seção não será salva como completa.",
      });
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Salvando respostas antes de navegar para a próxima seção");
      
      // Tentar salvar respostas antes de avançar
      if (saveResponses) {
        await saveResponses();
        console.log("Respostas salvas com sucesso");
      }
      
      // Navegar para a próxima seção apenas após salvar com sucesso
      console.log("Navegando para próxima seção");
      handleNextSection();
      
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousSection}
        disabled={isFirstSection || isProcessing}
        className="flex-1 text-xs h-8"
      >
        <ArrowLeftCircle className="mr-1 h-3 w-3" />
        Anterior
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextSectionClick}
        disabled={isLastSection || isProcessing}
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
