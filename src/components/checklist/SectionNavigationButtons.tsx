
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
}

const SectionNavigationButtons: React.FC<SectionNavigationButtonsProps> = ({
  isFirstSection,
  isLastSection,
  handlePreviousSection,
  handleNextSection,
  hasUnansweredQuestions
}) => {
  const { toast } = useToast();
  
  const onNextSectionClick = () => {
    if (isLastSection) return;
    
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Existem perguntas não respondidas nesta seção. Você ainda pode avançar, mas a seção não será salva como completa.",
      });
    }
    
    handleNextSection();
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
