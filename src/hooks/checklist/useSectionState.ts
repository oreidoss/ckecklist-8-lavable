
import { useState, useEffect, useCallback } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

type UseSectionStateProps = {
  secoes: Secao[] | undefined;
  activeSecao: string | null;
  completedSections: string[];
  setCompletedSections: React.Dispatch<React.SetStateAction<string[]>>;
  respostas: Record<string, RespostaValor>;
  perguntas: Pergunta[] | undefined;
};

export const useSectionState = ({
  secoes,
  activeSecao,
  completedSections,
  setCompletedSections,
  respostas,
  perguntas
}: UseSectionStateProps) => {
  const [isEditingActive, setIsEditingActive] = useState(true);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});

  // Initialize editing sections state based on completed sections
  useEffect(() => {
    if (secoes && completedSections) {
      console.log("Initializing edit state for sections");
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        initialEditState[secao.id] = !completedSections.includes(secao.id);
      });
      setEditingSections(initialEditState);
    }
  }, [secoes, completedSections]);

  const toggleEditMode = useCallback(() => {
    if (!activeSecao) return;
    
    setEditingSections(prev => ({
      ...prev,
      [activeSecao]: !prev[activeSecao]
    }));
    setIsEditingActive(prev => !prev);
  }, [activeSecao]);

  return {
    isEditingActive,
    editingSections,
    setEditingSections,
    toggleEditMode
  };
};
