
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
    // Se for a seção ativa, use o estilo padrão
    if (activeSecao === secao.id) return "default";
    
    // Verifique se a seção tem pontuação (significa que tem respostas salvas)
    const pontuacao = pontuacaoPorSecao[secao.id] || 0;
    if (pontuacao > 0) {
      // Seção tem respostas salvas
      return "success"; // Verde para seções com respostas salvas
    }
    
    // Verifique se a seção está em completedSections
    if (completedSections.includes(secao.id)) {
      return "success"; // Verde para seções totalmente concluídas
    }
    
    // Seções iniciadas mas não concluídas são amarelas
    if (incompleteSections.includes(secao.id)) {
      return "warning"; // Amarelo para seções em andamento
    }
    
    // Seções não iniciadas são outline/branco
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
            {/* Mostrar ícone de verificação se completa OU se tem pontuação mas não está marcada como completada */}
            {(isCompleted || (!isCompleted && hasPontuacao)) && <Check className="h-4 w-4" />}
            
            {/* Mostrar ícone de alerta apenas se incompleta e sem pontuação */}
            {isIncomplete && !hasPontuacao && <AlertTriangle className="h-4 w-4 text-bright-orange" />}
            
            {secao.nome}
            
            {/* Sempre mostrar a pontuação se estiver disponível */}
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
