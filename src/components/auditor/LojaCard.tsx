
import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Calendar, User, Plus, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from "@/components/ui/card";
import { Auditoria } from '@/lib/types';

type Loja = Database['public']['Tables']['lojas']['Row'];

interface LojaCardProps {
  loja: Loja & { auditorias: Auditoria[] };
  onNewAudit: (lojaId: string) => void;
  isCreatingAudit: boolean;
}

export const LojaCard: React.FC<LojaCardProps> = ({ 
  loja, 
  onNewAudit,
  isCreatingAudit
}) => {
  const latestAudit = loja.auditorias?.sort((a, b) => 
    new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
  )[0];
  
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="overflow-hidden bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]">
      <div className="p-6">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-[#9b87f5] p-3 transform transition-transform duration-300 hover:rotate-12">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{loja.nome}</h2>
            <p className="text-sm text-gray-600">
              Gerente: {latestAudit?.gerente || 'Não definido'}
            </p>
          </div>
        </div>

        {/* Audit information */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Último checklist:</span>
            <span className="text-gray-900 font-medium">
              {formatDate(latestAudit?.data || null)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Pontuação:</span>
            <span className="text-gray-900 font-medium">
              {latestAudit?.pontuacao_total ? `${latestAudit.pontuacao_total} pts` : '-'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 bg-[#F3F4FF] text-[#9b87f5] hover:bg-[#E8E9FF] transition-colors duration-300"
            onClick={() => {}}
          >
            <History className="h-4 w-4 mr-2 transform transition-transform group-hover:rotate-180 duration-300" />
            Histórico
          </Button>
          
          <Button
            variant="default"
            className="flex-1 bg-[#9b87f5] hover:bg-[#8a76e4] transition-all duration-300 transform active:scale-95"
            onClick={() => onNewAudit(loja.id)}
            disabled={isCreatingAudit}
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
            {latestAudit ? 'Novo Checklist' : 'Avaliar'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
