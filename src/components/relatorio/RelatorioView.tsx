
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RelatorioDetalhado from '@/components/relatorio/RelatorioDetalhado';
import { RelatorioActions } from '@/components/relatorio/RelatorioActions';
import { exportToPdf } from '@/utils/pdfExport';

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
  
  const handleExportPDF = () => {
    if (reportRef.current) {
      exportToPdf(reportRef, undefined, "O relatório completo foi exportado com sucesso!");
    }
  };

  return (
    <div className="relative">
      <RelatorioActions 
        auditoria={auditoria} 
        usuarios={usuarios} 
        refetchAuditoria={refetchAuditoria}
        exportarPDF={handleExportPDF} 
      />
      
      <div ref={reportRef} className="pdf-container">
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
