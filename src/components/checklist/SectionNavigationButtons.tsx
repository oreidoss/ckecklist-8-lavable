
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
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
  
  const onNextSectionClick = async () => {
    if (isLastSection) return;
    
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Existem perguntas não respondidas nesta seção. Você ainda pode avançar, mas a seção não será salva como completa.",
      });
    }
    
    // Save responses before advancing to next section
    if (saveResponses) {
      try {
        await saveResponses();
        // Only navigate after successful save
        handleNextSection();
      } catch (error) {
        console.error("Error saving responses:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar as respostas. Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      // If no save function provided, just navigate
      handleNextSection();
    }
  };
  
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousSection}
        disabled={isFirstSection}
        className="flex-1 text-xs h-8"
      >
        <ArrowLeftCircle className="mr-1 h-3 w-3" />
        Anterior
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextSectionClick}
        disabled={isLastSection}
        className="flex-1 text-xs h-8"
      >
        Próxima
        <ArrowRightCircle className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
};

export default SectionNavigationButtons;
