
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
    
    // Se tem 100% das perguntas respondidas, usar verde
    if (percentage === 100) return "success";
    
    // Se tem respostas mas não está completo, usar vermelho
    if (percentage > 0 && percentage < 100) return "destructive";
    
    // Se não há respostas ainda (0%), usar outline
    return "outline";
  };

  const getButtonStyles = (secao: Secao) => {
    if (activeSecao === secao.id) return "";
    
    const percentage = completionPercentages[secao.id] || 0;
    
    // Se tem 100% das perguntas respondidas, usar verde sólido
    if (percentage === 100) return "bg-green-500 text-white hover:bg-green-600 border-green-500";
    
    // Se tem respostas mas não está completo, usar vermelho sólido
    if (percentage > 0 && percentage < 100) return "bg-red-500 text-white hover:bg-red-600 border-red-500";
    
    // Se não há respostas ainda (0%), usar cinza outline
    return "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200";
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
            className={`whitespace-nowrap flex items-center gap-1 relative ${getButtonStyles(secao)}`}
          >
            {/* Show check icon if completed */}
            {isCompleted && <Check className="h-4 w-4" />}
            
            {/* Show warning icon if not started */}
            {isNotStarted && <AlertTriangle className="h-4 w-4" />}
            
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
