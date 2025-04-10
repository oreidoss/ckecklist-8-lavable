
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionNavigationProps {
  secoes: any[];
  activeSecao: string | null;
  completedSections: string[];
  incompleteSections: string[];
  setActiveSecao: (secaoId: string) => void;
  pontuacaoPorSecao?: Record<string, number>;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  secoes,
  activeSecao,
  completedSections,
  incompleteSections,
  setActiveSecao,
  pontuacaoPorSecao = {}
}) => {
  // Função para determinar classes de estilo com base no status da seção
  const getSectionClasses = (secaoId: string) => {
    const isActive = secaoId === activeSecao;
    const isCompleted = completedSections.includes(secaoId);
    const isIncomplete = incompleteSections.includes(secaoId);
    
    let baseClasses = "px-3 py-2 rounded-md text-xs font-medium flex flex-col items-center justify-center relative min-h-[73px]";
    
    if (isActive) {
      baseClasses += " bg-blue-100 border-2 border-blue-400";
    } else if (isCompleted) {
      baseClasses += " bg-green-100 hover:bg-green-200 cursor-pointer";
    } else if (isIncomplete) {
      baseClasses += " bg-yellow-100 hover:bg-yellow-200 cursor-pointer";
    } else {
      baseClasses += " bg-gray-100 hover:bg-gray-200 cursor-pointer";
    }
    
    return baseClasses;
  };

  // Função para obter o ícone de status da seção
  const getSectionStatusIcon = (secaoId: string) => {
    if (completedSections.includes(secaoId)) {
      return <Check className="h-4 w-4 text-green-500 absolute top-1 left-1" />;
    } else if (incompleteSections.includes(secaoId)) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 absolute top-1 left-1" />;
    }
    return null;
  };

  const displayPontuacao = (secaoId: string) => {
    if (pontuacaoPorSecao && secaoId in pontuacaoPorSecao) {
      const pontuacao = pontuacaoPorSecao[secaoId];
      return (
        <span className="absolute top-0 right-0 bg-white text-gray-800 text-xs rounded-bl-md px-1 py-0.5 font-bold">
          {pontuacao?.toFixed(1)}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin snap-x">
      {secoes.map((secao) => (
        <button
          key={secao.id}
          className={cn(getSectionClasses(secao.id))}
          onClick={() => setActiveSecao(secao.id)}
        >
          {getSectionStatusIcon(secao.id)}
          {displayPontuacao(secao.id)}
          {secao.nome}
        </button>
      ))}
    </div>
  );
};

export default SectionNavigation;
