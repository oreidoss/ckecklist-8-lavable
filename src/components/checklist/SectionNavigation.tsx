
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
  completionPercentages?: Record<string, number>;
  pontuacaoPorSecao?: Record<string, number>;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  secoes,
  activeSecao,
  completedSections,
  incompleteSections,
  setActiveSecao,
  completionPercentages = {},
  pontuacaoPorSecao = {}
}) => {
  const getButtonVariant = (secao: Secao) => {
    // If it's the active section, use default style
    if (activeSecao === secao.id) return "default";
    
    const percentage = completionPercentages[secao.id] || 0;
    const pontuacao = pontuacaoPorSecao[secao.id] || 0;
    
    // Se não há respostas ainda (0%), usar outline
    if (percentage === 0) return "outline";
    
    // Se tem 100% das perguntas respondidas, usar verde
    if (percentage === 100) return "success";
    
    // Se tem respostas mas não está completo, usar vermelho
    if (percentage > 0 && percentage < 100) return "destructive";
    
    return "outline";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {secoes?.map((secao) => {
        const percentage = completionPercentages[secao.id] || 0;
        const pontuacao = pontuacaoPorSecao[secao.id] || 0;
        const isCompleted = percentage === 100;
        const isInProgress = percentage > 0 && percentage < 100;
        const isNotStarted = percentage === 0;
        
        return (
          <Button
            key={secao.id}
            variant={getButtonVariant(secao)}
            onClick={() => setActiveSecao(secao.id)}
            className={`whitespace-nowrap flex items-center gap-1 relative ${
              isNotStarted 
                ? 'bg-soft-orange/20 text-bright-orange border-soft-orange hover:bg-soft-orange/30' 
                : ''
            }`}
          >
            {/* Show check icon if completed */}
            {isCompleted && <Check className="h-4 w-4" />}
            
            {/* Show warning icon if not started */}
            {isNotStarted && <AlertTriangle className="h-4 w-4 text-bright-orange" />}
            
            {secao.nome}
            
            {/* Badge com pontuação */}
            <span 
              className="absolute -top-1 -right-1 bg-white text-black text-xs px-1 py-0 rounded-full border border-gray-300 font-semibold"
              style={{ fontSize: '10px', minWidth: '30px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {pontuacao.toFixed(1)}
            </span>
            
            {/* Badge com porcentagem */}
            <span 
              className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-1 py-0 rounded-full font-semibold"
              style={{ fontSize: '9px', minWidth: '22px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {percentage}%
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default SectionNavigation;
