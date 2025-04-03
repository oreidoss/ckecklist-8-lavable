
import React from 'react';
import { PageTitle } from "@/components/PageTitle";
import { DesempenhoLojasCard } from '@/components/relatorios/DesempenhoLojasCard';
import { HistoricoAuditoriasCard } from '@/components/relatorios/HistoricoAuditoriasCard';
import { ResumoGeral } from '@/components/relatorios/ResumoGeral';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';

const AdminRelatorios: React.FC = () => {
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
  
  return (
    <div>
      <PageTitle 
        title="Relatórios de Auditorias" 
        description="Visualize e analise os resultados das auditorias realizadas"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <DesempenhoLojasCard 
            dadosGrafico={dadosGrafico} 
            lojas={lojas} 
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
