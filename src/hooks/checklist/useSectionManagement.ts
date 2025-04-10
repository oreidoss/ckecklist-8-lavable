
import { useState, useEffect } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { db } from '@/lib/db';
import { perguntaService } from '@/lib/services/perguntaService';

/**
 * Hook for managing section state and edit mode
 */
export const useSectionManagement = (secoes: Secao[] | undefined, initialCompletedSections: string[] = []) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [secaoPerguntas, setSecaoPerguntas] = useState<Record<string, Pergunta[]>>({});
  
  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);
  
  // Initialize editing state based on initial completed sections
  useEffect(() => {
    if (secoes) {
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        // If initialCompletedSections is provided and has items, use it to determine edit state
        if (initialCompletedSections?.length) {
          initialEditState[secao.id] = !initialCompletedSections.includes(secao.id);
        } else {
          // Otherwise, all sections start in edit mode
          initialEditState[secao.id] = true;
        }
      });
      setEditingSections(initialEditState);
    }
  }, [secoes, initialCompletedSections]);
  
  // Load all perguntas for each section on initialization
  useEffect(() => {
    if (secoes) {
      // Carregar todas as perguntas uma vez
      const allPerguntas = perguntaService.getPerguntas();
      
      // Organizar perguntas por seção
      const perguntasPorSecao: Record<string, Pergunta[]> = {};
      
      secoes.forEach(secao => {
        perguntasPorSecao[secao.id] = allPerguntas.filter(
          pergunta => pergunta.secao_id === secao.id
        );
      });
      
      setSecaoPerguntas(perguntasPorSecao);
      console.log("Perguntas carregadas por seção:", perguntasPorSecao);
    }
  }, [secoes]);
  
  // Check if current section is in editing mode
  const isEditingActive = activeSecao ? editingSections[activeSecao] === true : false;
  
  // Toggle edit mode for the active section
  const toggleEditMode = () => {
    if (!activeSecao) return;
    
    console.log(`Alternando modo de edição para seção ${activeSecao}. Atual: ${editingSections[activeSecao]}`);
    
    setEditingSections(prev => {
      const newState = {
        ...prev,
        [activeSecao]: !prev[activeSecao]
      };
      console.log("Novo estado de edição:", newState);
      return newState;
    });
  };

  /**
   * Get questions for the specified section
   */
  const getPerguntasBySecao = (secaoId: string): Pergunta[] => {
    // Verificar se temos perguntas carregadas para esta seção
    if (secaoPerguntas[secaoId]) {
      return secaoPerguntas[secaoId];
    }
    
    // Se não tivermos em cache, buscar do serviço
    const perguntas = perguntaService.getPerguntasBySecao(secaoId);
    console.log(`Buscando perguntas para seção ${secaoId}:`, perguntas);
    return perguntas;
  };

  return {
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
    getPerguntasBySecao
  };
};
