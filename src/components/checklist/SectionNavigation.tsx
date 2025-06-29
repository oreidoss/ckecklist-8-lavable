
import React from 'react';
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
  const getButtonClasses = (secao: Secao) => {
    const percentage = completionPercentages[secao.id] || 0;
    
    console.log(`SectionNavigation - Seção ${secao.nome}: ${percentage}% - Ativa: ${activeSecao === secao.id}`);
    
    // Classes base
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 relative";
    
    // Se é a seção ativa, usar azul
    if (activeSecao === secao.id) {
      return `${baseClasses} !bg-blue-500 !text-white hover:!bg-blue-600 !border-blue-500 border`;
    }
    
    // Se tem 100% das perguntas respondidas, usar verde sólido
    if (percentage === 100) {
      return `${baseClasses} !bg-green-500 !text-white hover:!bg-green-600 !border-green-500 border`;
    }
    
    // Se tem respostas mas não está completo, usar vermelho sólido
    if (percentage > 0 && percentage < 100) {
      return `${baseClasses} !bg-red-500 !text-white hover:!bg-red-600 !border-red-500 border`;
    }
    
    // Se não há respostas ainda (0%), usar cinza outline
    return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-100 border`;
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
          <button
            key={secao.id}
            onClick={() => setActiveSecao(secao.id)}
            className={getButtonClasses(secao)}
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
          </button>
        );
      })}
    </div>
  );
};

export default SectionNavigation;
