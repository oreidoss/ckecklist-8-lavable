
import React, { useRef } from 'react';
import { PageTitle } from "@/components/PageTitle";
import { DesempenhoLojasCard } from '@/components/relatorios/DesempenhoLojasCard';
import { HistoricoAuditoriasCard } from '@/components/relatorios/HistoricoAuditoriasCard';
import { ResumoGeral } from '@/components/relatorios/ResumoGeral';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from '@/utils/pdf';

const AdminRelatorios: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    lojaFiltro,
    setLojaFiltro,
    dadosGrafico,
    auditorias,
    auditoriasFiltradas,
    isLoadingAuditorias,
    lojas,
    estatisticas
  } = useRelatoriosData();
  
  // Função para exportar o relatório completo como PDF
  const exportarRelatorioCompleto = () => {
    if (!reportRef.current) return;
    
    const options = {
      margin: 1,
      filename: 'relatorio-completo-auditorias.pdf',
    };
    
    generatePDF(reportRef.current, options, "O relatório completo foi exportado com sucesso!");
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle 
          title="Relatórios de Auditorias" 
          description="Visualize e analise os resultados das auditorias realizadas"
        />
        <Button onClick={exportarRelatorioCompleto}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </div>
      
      <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <DesempenhoLojasCard 
            dadosGrafico={dadosGrafico} 
            lojas={lojas} 
            onExportPDF={exportarRelatorioCompleto}
          />
          
          <HistoricoAuditoriasCard 
            auditoriasFiltradas={auditoriasFiltradas}
            isLoadingAuditorias={isLoadingAuditorias}
            lojaFiltro={lojaFiltro}
            setLojaFiltro={setLojaFiltro}
            lojas={lojas}
          />
        </div>
        
        <ResumoGeral 
          estatisticas={estatisticas}
          auditorias={auditorias}
        />
      </div>
    </div>
  );
};

export default AdminRelatorios;
