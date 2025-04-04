
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { HistoricoLoja } from '@/components/relatorio/HistoricoLoja';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-10rem)] w-full px-1">
        <HistoricoLoja 
          auditoriasPorLoja={auditoriasPorLoja}
          perguntas={perguntas}
        />
      </ScrollArea>
    </div>
  );
};

export default LojaHistoryView;
