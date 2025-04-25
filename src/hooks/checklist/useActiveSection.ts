
import { useState, useCallback, useEffect } from 'react';
import { Secao } from '@/lib/types';

export const useActiveSection = (
  secoes: Secao[] | undefined,
  completedSections: string[]
) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [isEditingActive, setIsEditingActive] = useState<boolean>(true);
  
  // Configurar a primeira seção por padrão quando os dados são carregados
  useEffect(() => {
    if (secoes && secoes.length > 0 && !activeSecao) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);

  // Se a seção ativa estiver concluída, por padrão desative o modo de edição
  useEffect(() => {
    if (activeSecao && completedSections.includes(activeSecao)) {
      setIsEditingActive(false);
    } else {
      // Se a seção não estiver concluída, sempre ativamos o modo de edição
      setIsEditingActive(true);
    }
  }, [activeSecao, completedSections]);

  // Função para alternar o modo de edição
  const toggleEditMode = useCallback(() => {
    console.log("Alternando modo de edição:", !isEditingActive);
    setIsEditingActive(prev => !prev);
  }, [isEditingActive]);

  return {
    activeSecao,
    setActiveSecao,
    isEditingActive,
    setIsEditingActive,
    toggleEditMode
  };
};
