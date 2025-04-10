
import { useState, useCallback } from 'react';
import { Secao } from '@/lib/types';

interface SectionManagementOptions {
  initialActiveSecao?: string | null;
}

/**
 * Hook para gerenciar a seção ativa e o estado de edição das seções
 */
export const useSectionManagement = (
  secoes: Secao[] | undefined,
  completedSections: string[],
  options?: SectionManagementOptions
) => {
  // Estado para a seção ativa
  const [activeSecao, setActiveSecao] = useState<string | null>(() => {
    // Se houver uma seção ativa inicial como opção, use-a
    if (options?.initialActiveSecao) {
      return options.initialActiveSecao;
    }
    
    // Caso contrário, use a primeira seção da lista, se disponível
    if (secoes && secoes.length > 0) {
      return secoes[0].id;
    }
    
    return null;
  });
  
  // Mapa de estado de edição para cada seção
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>(() => {
    const editMap: Record<string, boolean> = {};
    
    if (secoes) {
      secoes.forEach(secao => {
        // Inicialmente, a seção está em modo de edição se não estiver nas seções concluídas
        editMap[secao.id] = !completedSections.includes(secao.id);
      });
    }
    
    return editMap;
  });
  
  // Verificar se a edição está ativa para a seção atual
  const isEditingActive = useCallback(() => {
    if (!activeSecao) return true;
    
    // Se a seção estiver no mapa de editingSections, use esse valor
    if (activeSecao in editingSections) {
      return editingSections[activeSecao];
    }
    
    // Por padrão, permita edição
    return true;
  }, [activeSecao, editingSections]);
  
  // Função para alternar o modo de edição para a seção ativa
  const toggleEditMode = useCallback(() => {
    if (!activeSecao) return;
    
    setEditingSections(prev => ({
      ...prev,
      [activeSecao]: !prev[activeSecao]
    }));
    
    console.log(`Modo de edição para seção ${activeSecao} alternado para ${!editingSections[activeSecao]}`);
  }, [activeSecao, editingSections]);
  
  // Função para obter perguntas por seção
  const getPerguntasBySecao = useCallback((secaoId: string) => {
    // Esta é uma função auxiliar que deverá ser implementada pelo componente pai
    // e passada como prop, já que este hook não tem acesso às perguntas
    return [];
  }, []);

  return {
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive: isEditingActive(),
    toggleEditMode,
    getPerguntasBySecao
  };
};
