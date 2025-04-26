
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RelatorioDetalhado from '@/components/relatorio/RelatorioDetalhado';
import { RelatorioActions } from '@/components/relatorio/RelatorioActions';
import { exportToPdf } from '@/utils/pdfExport';
import { useIsMobile } from '@/hooks/use-mobile';

interface RelatorioViewProps {
  auditoria: any;
  loja: any;
  respostas: any[];
  perguntas: any[];
  secoes: any[];
  auditorias: any[];
  usuarios: any[];
  refetchAuditoria: () => void;
}

const RelatorioView: React.FC<RelatorioViewProps> = ({ 
  auditoria, 
  loja, 
  respostas, 
  perguntas, 
  secoes, 
  auditorias,
  usuarios,
  refetchAuditoria
}) => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const handleExportPDF = () => {
    if (reportRef.current) {
      exportToPdf(reportRef.current, undefined, "O relatório completo foi exportado com sucesso!");
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-x-hidden">
      <RelatorioActions 
        auditoria={auditoria} 
        usuarios={usuarios} 
        reportRef={reportRef}
        refetchAuditoria={refetchAuditoria}
        exportarPDF={handleExportPDF} 
      />
      
      <div ref={reportRef} className="pdf-container w-full max-w-full">
        <RelatorioDetalhado 
          auditoria={auditoria} 
          loja={loja} 
          respostas={respostas} 
          perguntas={perguntas} 
          secoes={secoes}
          auditorias={auditorias}
        />
      </div>
    </div>
  );
};

export default RelatorioView;
