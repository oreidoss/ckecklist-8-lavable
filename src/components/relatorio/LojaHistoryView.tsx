
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, FileText } from 'lucide-react';
import { HistoricoLoja } from '@/components/relatorio/HistoricoLoja';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTitle } from '@/components/PageTitle';

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

  if (!auditoriasPorLoja || !auditoriasPorLoja.loja) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Nenhum histórico encontrado</h2>
        <p className="text-gray-500 mt-2">Não foi possível encontrar histórico para esta loja</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <Button variant="outline" onClick={() => navigate(-1)} size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <PageTitle 
          title={`Histórico: ${auditoriasPorLoja.loja.nome}`}
          description="Histórico de checklists realizados"
          className="hidden md:block"
        />
      </div>
      
      <div className="md:hidden mb-4">
        <PageTitle 
          title={`Histórico: ${auditoriasPorLoja.loja.nome}`}
          description="Histórico de checklists realizados"
        />
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
