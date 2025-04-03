
import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Calendar, User, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'] & {
  role?: string;
};
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

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
  const isMobile = useIsMobile();
  
  const latestAudit = loja.auditorias?.sort((a, b) => 
    new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
  )[0];

  const hasOngoingAudit = latestAudit && latestAudit.status !== 'concluido';

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="flex items-center">
            <Store className="h-5 w-5 md:h-6 md:w-6 text-[#00bfa5] mr-2 md:mr-3" />
            <h2 className="text-lg md:text-xl font-bold">{loja.nome}</h2>
          </div>
        </div>

        {latestAudit && (
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
            {latestAudit.data && (
              <div className="flex items-center text-gray-600 text-sm md:text-base">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                {new Date(latestAudit.data).toLocaleDateString('pt-BR')}
              </div>
            )}
            <div className="flex items-center text-gray-600 text-sm md:text-base">
              <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
              Supervisor(a): {latestAudit.supervisor || 'Não definido'}
            </div>
            <div className="flex items-center text-gray-600 text-sm md:text-base">
              <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
              Gerente: {latestAudit.gerente || 'Não definido'}
            </div>
            {latestAudit.pontuacao_total !== null && latestAudit.pontuacao_total !== undefined && (
              <div className="flex items-center text-[#00c853] font-medium text-sm md:text-base">
                <span className="inline-block w-4 h-4 md:w-5 md:h-5 mr-2">↗</span>
                {latestAudit.pontuacao_total} pts
              </div>
            )}
          </div>
        )}

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-2'}`}>
          {hasOngoingAudit && (
            <Button
              className="bg-[#ffc107] hover:bg-[#ffb300] text-black text-xs md:text-sm"
              asChild
              size={isMobile ? "sm" : "default"}
            >
              <Link to={`/checklist/${latestAudit.id}`}>
                Continuar
              </Link>
            </Button>
          )}
          <Button
            variant={!hasOngoingAudit ? "default" : "outline"}
            className={`text-xs md:text-sm ${!hasOngoingAudit ? "bg-[#00bfa5] hover:bg-[#00a896]" : ""}`}
            onClick={() => onNewAudit(loja.id)}
            disabled={isCreatingAudit}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            {!hasOngoingAudit ? "Avaliar" : "Nova"}
          </Button>
          <Button 
            variant="outline" 
            asChild
            size={isMobile ? "sm" : "default"}
            className="text-xs md:text-sm"
          >
            <Link to={`/relatorio/loja/${loja.id}`}>
              Histórico
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
