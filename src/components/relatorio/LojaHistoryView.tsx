
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { HistoricoLoja } from '@/components/relatorio/HistoricoLoja';
import { useIsMobile } from '@/hooks/use-mobile';

interface LojaHistoryViewProps {
  auditoriasPorLoja: {
    loja: any;
    auditorias: any[];
  };
  perguntas: any[];
}

const LojaHistoryView: React.FC<LojaHistoryViewProps> = ({ 
  auditoriasPorLoja,
  perguntas
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <Button variant="outline" onClick={() => navigate(-1)} size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <div className="w-full max-w-full overflow-x-hidden">
        <HistoricoLoja 
          auditoriasPorLoja={auditoriasPorLoja}
          perguntas={perguntas}
        />
      </div>
    </div>
  );
};

export default LojaHistoryView;
