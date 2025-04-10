
import { useState, useEffect } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { useChecklist } from '@/hooks/checklist';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook for managing checklist navigation and section state
 */
export const useChecklistNavigation = (
  auditoriaId: string | undefined,
  secoes: Secao[] | undefined,
  perguntas: Pergunta[] | undefined,
  activeSecao: string | null,
  setActiveSecao: (secaoId: string) => void,
  editingSections: Record<string, boolean>,
  setEditingSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Checklist state and handlers from main hook
  const {
    respostas,
    setRespostas,
    progresso, 
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);
  
  // Section navigation from existing hook
  const {
    incompleteSections,
    setIncompleteSections,
    updateIncompleteSections,
    goToNextSection: goToNextSectionBase,
    goToPreviousSection: goToPreviousSectionBase,
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas
  });

  // Custom navigation functions
  const goToPreviousSection = () => {
    if (goToPreviousSectionBase && typeof goToPreviousSectionBase === 'function') {
      goToPreviousSectionBase();
    }
  };

  const goToNextSection = () => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      const nextSecaoId = secoes[currentIndex + 1].id;
      setActiveSecao(nextSecaoId);
      window.scrollTo(0, 0);
      console.log(`Navegado para próxima seção: ${nextSecaoId}`);
    }
  };

  return {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    incompleteSections,
    setIncompleteSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    updateCompletedSections,
    updateIncompleteSections,
    goToPreviousSection,
    goToNextSection
  };
};
