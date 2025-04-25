
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle } from 'lucide-react';
import { Secao } from '@/lib/types';

interface SectionNavigationProps {
  secoes: Secao[];
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
  const getButtonVariant = (secao: Secao) => {
    // If it's the active section, use default style
    if (activeSecao === secao.id) return "default";
    
    // Check if section has pontuacao but no completions
    const pontuacao = pontuacaoPorSecao[secao.id] || 0;
    if (pontuacao > 0 && !completedSections.includes(secao.id)) {
      // This means section has responses but may not be fully completed
      return "success"; // Green for sections with responses
    }
    
    // Check if section is in completedSections
    if (completedSections.includes(secao.id)) {
      return "success"; // Green for fully completed
    }
    
    // Sections started but not completed are yellow
    if (incompleteSections.includes(secao.id)) {
      return "warning"; // Yellow for in-progress sections
    }
    
    // Not started sections are outline/white
    return "outline";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {secoes?.map((secao) => {
        const isCompleted = completedSections.includes(secao.id);
        const isIncomplete = incompleteSections.includes(secao.id);
        const pontuacao = pontuacaoPorSecao[secao.id];
        const hasPontuacao = pontuacao !== undefined && pontuacao !== 0;
        
        return (
          <Button
            key={secao.id}
            variant={getButtonVariant(secao)}
            onClick={() => setActiveSecao(secao.id)}
            className={`whitespace-nowrap flex items-center gap-1 relative ${
              !isCompleted && !hasPontuacao 
                ? 'bg-soft-orange/20 text-bright-orange border-soft-orange hover:bg-soft-orange/30' 
                : ''
            }`}
          >
            {/* Show check icon if completed OR if has pontuacao but not marked as completed */}
            {(isCompleted || (!isCompleted && hasPontuacao)) && <Check className="h-4 w-4" />}
            
            {/* Only show warning icon if incomplete and no pontuacao */}
            {isIncomplete && !hasPontuacao && <AlertTriangle className="h-4 w-4 text-bright-orange" />}
            
            {secao.nome}
            
            {/* Always show score if it's available */}
            {hasPontuacao && (
              <span 
                className="absolute -top-1 -right-1 bg-white text-black text-xs px-1 py-0 rounded-full border border-gray-300 font-semibold"
                style={{ fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {typeof pontuacao === 'number' ? pontuacao.toFixed(1) : pontuacao}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default SectionNavigation;

