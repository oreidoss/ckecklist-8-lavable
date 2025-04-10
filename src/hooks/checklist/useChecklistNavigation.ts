
import { useState, useEffect, useCallback } from 'react';
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

  // Monitorar quando a edição de uma seção muda
  useEffect(() => {
    if (secoes && activeSecao && editingSections) {
      console.log(
        `Estado de edição da seção ${activeSecao} alterado para: ${editingSections[activeSecao] ? 'editável' : 'não editável'}`
      );
    }
  }, [editingSections, activeSecao, secoes]);

  // Custom navigation functions
  const goToPreviousSection = useCallback(() => {
    if (goToPreviousSectionBase && typeof goToPreviousSectionBase === 'function') {
      goToPreviousSectionBase();
    }
  }, [goToPreviousSectionBase]);

  const goToNextSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      const nextSecaoId = secoes[currentIndex + 1].id;
      console.log(`Navegando para próxima seção: ${nextSecaoId}`);
      setActiveSecao(nextSecaoId);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao, setActiveSecao]);

  // Nova função para salvar o progresso e navegar para a próxima seção
  const saveAndNavigateToNextSection = useCallback(async () => {
    if (!secoes || !activeSecao) return false;
    
    console.log("Salvando e navegando para a próxima seção...");
    
    // Atualizar seções completas e incompletas
    updateCompletedSections();
    updateIncompleteSections();
    
    // Navegar para a próxima seção
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      const nextSecaoId = secoes[currentIndex + 1].id;
      console.log(`Navegando para próxima seção: ${nextSecaoId}`);
      setActiveSecao(nextSecaoId);
      window.scrollTo(0, 0);
      return true;
    }
    
    return false;
  }, [secoes, activeSecao, setActiveSecao, updateCompletedSections, updateIncompleteSections]);

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
    goToNextSection,
    saveAndNavigateToNextSection
  };
};
