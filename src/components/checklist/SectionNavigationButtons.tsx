
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
    
    // Salvar respostas antes de avançar para a próxima seção
    if (saveResponses) {
      try {
        setIsProcessing(true);
        console.log("Salvando respostas antes de navegar para a próxima seção");
        await saveResponses();
        // Apenas navega após salvar com sucesso
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
    } else {
      // Se nenhuma função de salvamento for fornecida, apenas navega
      handleNextSection();
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
