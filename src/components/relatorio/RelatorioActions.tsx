
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import { EditInformacoesDialog } from './EditInformacoesDialog';

interface RelatorioActionsProps {
  auditoria: any;
  usuarios: any[];
  refetchAuditoria: () => void;
  exportarPDF: () => void;
}

export const RelatorioActions: React.FC<RelatorioActionsProps> = ({ 
  auditoria, 
  usuarios, 
  refetchAuditoria, 
  exportarPDF 
}) => {
  const navigate = useNavigate();

  // Filter usuarios by role if available
  const supervisores = usuarios.filter(u => u.role === 'supervisor' || !u.role);
  const gerentes = usuarios.filter(u => u.role === 'gerente' || !u.role);

  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <div className="flex space-x-2">
        <EditInformacoesDialog 
          auditoria={auditoria} 
          usuarios={usuarios}
          supervisores={supervisores}
          gerentes={gerentes}
          refetchAuditoria={refetchAuditoria} 
        />
        
        <Button onClick={exportarPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
