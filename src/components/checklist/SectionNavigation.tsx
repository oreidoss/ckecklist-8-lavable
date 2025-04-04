
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
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  secoes,
  activeSecao,
  completedSections,
  incompleteSections,
  setActiveSecao
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {secoes?.map((secao) => {
        const isCompleted = completedSections.includes(secao.id);
        const isIncomplete = incompleteSections.includes(secao.id);
        return (
          <Button
            key={secao.id}
            variant={activeSecao === secao.id ? "default" : "outline"}
            onClick={() => setActiveSecao(secao.id)}
            className={`whitespace-nowrap flex items-center gap-1 ${
              activeSecao === secao.id 
                ? 'bg-[#00bfa5] hover:bg-[#00a896]' 
                : isCompleted 
                  ? 'bg-[#4ade80] text-white hover:bg-[#22c55e]' 
                  : isIncomplete
                    ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                    : ''
            }`}
          >
            {isCompleted && <Check className="h-4 w-4" />}
            {isIncomplete && <AlertTriangle className="h-4 w-4" />}
            {secao.nome}
          </Button>
        );
      })}
    </div>
  );
};

export default SectionNavigation;
