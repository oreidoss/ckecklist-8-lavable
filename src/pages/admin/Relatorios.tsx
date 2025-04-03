
import React, { useRef } from 'react';
import { PageTitle } from "@/components/PageTitle";
import { DesempenhoLojasCard } from '@/components/relatorios/DesempenhoLojasCard';
import { HistoricoAuditoriasCard } from '@/components/relatorios/HistoricoAuditoriasCard';
import { ResumoGeral } from '@/components/relatorios/ResumoGeral';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';

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
    
    // Clone do elemento para modificar para PDF
    const element = reportRef.current.cloneNode(true) as HTMLElement;
    
    // Adiciona estilo para o PDF
    const style = document.createElement('style');
    style.innerHTML = `
      body { font-family: 'Helvetica', 'Arial', sans-serif; }
      .pdf-header { text-align: center; margin-bottom: 20px; }
      .pdf-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      .pdf-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .card-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    `;
    element.appendChild(style);
    
    // Configurações do PDF
    const options = {
      margin: 1,
      filename: 'relatorio-completo-auditorias.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gera e baixa o PDF
    html2pdf().set(options).from(element).save();
    
    toast({
      title: "PDF Exportado",
      description: "O relatório completo foi exportado com sucesso!",
    });
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
