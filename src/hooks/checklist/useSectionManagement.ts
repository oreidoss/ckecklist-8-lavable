
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar o estado de seções e edição
 */
export const useSectionManagement = (
  secoes: any[] | undefined,
  completedSections: string[]
) => {
  // Estado para a seção ativa e para as seções sendo editadas
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [isEditingActive, setIsEditingActive] = useState(true);

  // Inicializa a primeira seção quando o componente monta
  useEffect(() => {
    if (secoes && secoes.length > 0 && !activeSecao) {
      setActiveSecao(secoes[0].id);
      console.log("Seção inicial definida:", secoes[0].id);
    }
  }, [secoes, activeSecao]);

  // Atualiza o estado de edição das seções quando as seções completadas mudam
  useEffect(() => {
    if (secoes && completedSections) {
      const updatedEditState: Record<string, boolean> = {};
      
      secoes.forEach(secao => {
        // Inicialmente, todas as seções estão em modo de edição
        // Seções completadas começam como não editáveis
        updatedEditState[secao.id] = !completedSections.includes(secao.id);
      });
      
      console.log("Estado de edição atualizado:", updatedEditState);
      console.log("Seções completadas:", completedSections);
      
      setEditingSections(updatedEditState);
    }
  }, [secoes, completedSections]);

  // Define a seção ativa e atualiza o estado isEditingActive com base na seção
  const setActiveSecaoAndUpdateEditState = useCallback((secaoId: string) => {
    setActiveSecao(secaoId);
    
    // Atualiza o estado isEditingActive com base na seção selecionada
    if (editingSections && secaoId in editingSections) {
      setIsEditingActive(editingSections[secaoId]);
      console.log(`Seção ${secaoId} ativada. Modo de edição: ${editingSections[secaoId]}`);
    } else {
      // Se não houver informação de edição para esta seção, assume que está no modo de edição
      setIsEditingActive(true);
      console.log(`Seção ${secaoId} ativada. Modo de edição padrão: true`);
    }
  }, [editingSections]);

  // Alternar o modo de edição para a seção ativa
  const toggleEditMode = useCallback(() => {
    if (!activeSecao) return;
    
    console.log(`Alternando modo de edição para seção ${activeSecao}`);
    setIsEditingActive(prev => !prev);
    
    // Atualiza o estado de edição da seção ativa
    setEditingSections(prev => ({
      ...prev,
      [activeSecao]: !prev[activeSecao]
    }));
  }, [activeSecao]);

  return {
    activeSecao,
    setActiveSecao: setActiveSecaoAndUpdateEditState,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode
  };
};
