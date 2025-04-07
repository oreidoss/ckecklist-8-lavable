
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ArrowLeft, 
  Store, 
  FileText, 
  Clock,
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { InfoLoja } from './InfoLoja';
import { HistoricoAuditorias } from './HistoricoAuditorias';
import { AnaliseTendencias } from './AnaliseTendencias';
import { generatePDF } from '@/utils/pdf';

interface HistoricoLojaProps {
  auditoriasPorLoja: {
    loja: any;
    auditorias: any[];
  };
  perguntas: any[];
}

export const HistoricoLoja: React.FC<HistoricoLojaProps> = ({ 
  auditoriasPorLoja,
  perguntas
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  // Generate and download PDF
  const exportarPDF = () => {
    if (!reportRef.current) return;
    
    const options = {
      filename: 'historico-loja-checklist90.pdf',
      margin: 1,
    };
    
    generatePDF(reportRef.current, options, "O histórico foi exportado com sucesso!");
  };

  const { loja, auditorias } = auditoriasPorLoja;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={exportarPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
      
      <div ref={reportRef} className="space-y-6">
        <PageTitle 
          title={`Histórico: ${loja.numero} - ${loja.nome}`}
          description="Histórico completo de auditorias realizadas nesta loja"
        />
        
        <InfoLoja loja={loja} auditorias={auditorias} />
        
        <HistoricoAuditorias auditorias={auditorias} />
        
        {auditorias && auditorias.length > 0 && (
          <AnaliseTendencias auditorias={auditorias} perguntas={perguntas} />
        )}
      </div>
    </div>
  );
};
