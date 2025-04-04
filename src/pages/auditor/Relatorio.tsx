
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRelatorioData } from '@/hooks/useRelatorioData';
import { useLojaHistoryData } from '@/hooks/useLojaHistoryData';
import RelatorioView from '@/components/relatorio/RelatorioView';
import LojaHistoryView from '@/components/relatorio/LojaHistoryView';
import RelatorioNotFound from '@/components/relatorio/RelatorioNotFound';
import RelatorioLoading from '@/components/relatorio/RelatorioLoading';

const Relatorio: React.FC = () => {
  const { auditoriaId, lojaId } = useParams();
  
  // Load data based on what parameters we have
  const { 
    secoes, 
    perguntas, 
    auditoria, 
    loadingAuditoria, 
    refetchAuditoria, 
    usuarios, 
    processedData 
  } = useRelatorioData();
  
  const { auditoriasPorLoja, loadingAuditoriasPorLoja } = useLojaHistoryData();
  
  // Show loading state while data is being fetched
  if (loadingAuditoria || loadingAuditoriasPorLoja) {
    return <RelatorioLoading />;
  }
  
  // Show not found state if data doesn't exist
  if ((!auditoria && !auditoriasPorLoja) || (lojaId && !auditoriasPorLoja?.loja)) {
    return <RelatorioNotFound />;
  }
  
  // Show detailed report if we have an auditoria
  if (processedData) {
    const { typedAuditoria, typedRespostas, typedAuditorias } = processedData;
    
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <RelatorioView
          auditoria={typedAuditoria}
          loja={auditoria.loja}
          respostas={typedRespostas}
          perguntas={perguntas}
          secoes={secoes}
          auditorias={typedAuditorias}
          usuarios={usuarios}
          refetchAuditoria={refetchAuditoria}
        />
      </div>
    );
  }
  
  // Show loja history if we have that data
  if (auditoriasPorLoja && perguntas) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <LojaHistoryView
          auditoriasPorLoja={auditoriasPorLoja}
          perguntas={perguntas}
        />
      </div>
    );
  }
  
  return null;
};

export default Relatorio;
