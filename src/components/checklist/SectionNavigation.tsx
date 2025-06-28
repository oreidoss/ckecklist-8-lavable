
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
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  secoes,
  activeSecao,
  completedSections,
  incompleteSections,
  setActiveSecao,
  completionPercentages = {}
}) => {
  const getButtonVariant = (secao: Secao) => {
    // If it's the active section, use default style
    if (activeSecao === secao.id) return "default";
    
    const percentage = completionPercentages[secao.id] || 0;
    
    // Check if section is completed (100%)
    if (percentage === 100) {
      return "success"; // Green for fully completed
    }
    
    // Check if section has some progress (1-99%)
    if (percentage > 0) {
      return "warning"; // Yellow for in-progress sections
    }
    
    // Not started sections are outline/white
    return "outline";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {secoes?.map((secao) => {
        const percentage = completionPercentages[secao.id] || 0;
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
            
            {/* Show percentage badge */}
            <span 
              className="absolute -top-1 -right-1 bg-white text-black text-xs px-1 py-0 rounded-full border border-gray-300 font-semibold"
              style={{ fontSize: '10px', minWidth: '24px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
