
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
    if (activeSecao === secao.id) return "default";
    
    // Fully completed sections are green
    const pontuacao = pontuacaoPorSecao[secao.id] || 0;
    const totalPontuacaoPossivel = 10; // Assuming a max score of 10
    const percentCompleted = (pontuacao / totalPontuacaoPossivel) * 100;
    
    if (percentCompleted === 100 || completedSections.includes(secao.id)) {
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
        const pontuacao = pontuacaoPorSecao[secao.id] || 0;
        
        return (
          <Button
            key={secao.id}
            variant={getButtonVariant(secao)}
            onClick={() => setActiveSecao(secao.id)}
            className="whitespace-nowrap flex items-center gap-1 relative"
          >
            {isCompleted && <Check className="h-4 w-4" />}
            {isIncomplete && <AlertTriangle className="h-4 w-4" />}
            {secao.nome}
            {pontuacao !== 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-white text-black text-xs px-1 py-0 rounded-full border border-gray-300 font-semibold"
                style={{ fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {pontuacao.toFixed(1)}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default SectionNavigation;
