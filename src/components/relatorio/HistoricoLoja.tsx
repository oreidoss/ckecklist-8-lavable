
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';
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

// PDF export options
const options = {
  margin: 1,
  filename: 'historico-loja.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
};

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
    
    // Clone the report element to modify it for PDF
    const element = reportRef.current.cloneNode(true) as HTMLElement;
    
    // Add some styling for the PDF
    const style = document.createElement('style');
    style.innerHTML = `
      body { font-family: 'Helvetica', 'Arial', sans-serif; }
      .pdf-header { text-align: center; margin-bottom: 20px; }
      .pdf-logo { font-size: 24px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .section-title { margin-top: 20px; font-size: 16px; font-weight: bold; }
    `;
    element.appendChild(style);
    
    // Convert to PDF and download
    html2pdf().set(options).from(element).save();
    
    toast({
      title: "PDF Exportado",
      description: "O histórico foi exportado com sucesso!",
    });
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
