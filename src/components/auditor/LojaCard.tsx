
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Calendar, User, Plus, History, AlertCircle, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from "@/components/ui/card";
import { Auditoria } from '@/lib/types';
import { Badge } from "@/components/ui/badge";

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
  const navigate = useNavigate();
  const latestAudit = loja.auditorias?.sort((a, b) => 
    new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
  )[0];
  
  // Verificar corretamente se existe uma auditoria em andamento
  const auditoriaEmAndamento = loja.auditorias?.find(a => a.status === 'em_andamento');
  const hasOngoingAudit = !!auditoriaEmAndamento;
  
  const getTotalScore = (audit: Auditoria) => {
    if (!audit || !audit.respostas) return 0;
    
    const uniqueRespostas = new Map();
    
    audit.respostas.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).forEach(resposta => {
      if (!uniqueRespostas.has(resposta.pergunta_id)) {
        uniqueRespostas.set(resposta.pergunta_id, resposta);
      }
    });
    
    return Array.from(uniqueRespostas.values()).reduce((total, resposta) => {
      return total + (resposta.pontuacao_obtida || 0);
    }, 0);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleViewHistory = () => {
    navigate(`/relatorio/loja/${loja.id}`);
  };

  const handleContinueAudit = () => {
    if (auditoriaEmAndamento) {
      navigate(`/checklist/${auditoriaEmAndamento.id}`);
    }
  };

  const totalScore = auditoriaEmAndamento ? getTotalScore(auditoriaEmAndamento) : 
                    latestAudit ? getTotalScore(latestAudit) : 0;

  return (
    <Card className="overflow-hidden bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="rounded-full bg-[#9b87f5] p-2 sm:p-3 transform transition-transform duration-300 hover:rotate-12">
            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{loja.nome}</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Gerente: {latestAudit?.gerente || 'Não definido'}
            </p>
            
            {hasOngoingAudit && (
              <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Checklist em andamento
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Último checklist:</span>
            <span className="text-xs sm:text-sm text-gray-900 font-medium">
              {formatDate(latestAudit?.data || null)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Pontuação:</span>
            <span className="text-xs sm:text-sm text-gray-900 font-medium">
              {totalScore ? `${totalScore} pts` : '-'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-[#F3F4FF] text-[#9b87f5] hover:bg-[#E8E9FF] transition-colors duration-300 text-xs sm:text-sm"
            onClick={handleViewHistory}
          >
            <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Histórico
          </Button>
          
          {hasOngoingAudit ? (
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-amber-500 hover:bg-amber-600 transition-all duration-300 transform active:scale-95 text-xs sm:text-sm"
              onClick={handleContinueAudit}
            >
              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Continuar
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-[#9b87f5] hover:bg-[#8a76e4] transition-all duration-300 transform active:scale-95 text-xs sm:text-sm"
              onClick={() => onNewAudit(loja.id)}
              disabled={isCreatingAudit}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {latestAudit ? 'Novo Checklist' : 'Avaliar'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
