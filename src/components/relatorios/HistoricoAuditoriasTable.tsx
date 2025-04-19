import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, FileText, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteAuditoriaDialog } from './DeleteAuditoriaDialog';
import { Database } from '@/integrations/supabase/types';

type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Database['public']['Tables']['lojas']['Row'];
  usuario?: Database['public']['Tables']['usuarios']['Row'];
};

interface HistoricoAuditoriasTableProps {
  auditoriasFiltradas?: Auditoria[];
  isLoadingAuditorias: boolean;
  lojaFiltro: string;
}

export const HistoricoAuditoriasTable: React.FC<HistoricoAuditoriasTableProps> = ({ 
  auditoriasFiltradas,
  isLoadingAuditorias,
  lojaFiltro
}) => {
  const navigate = useNavigate();

  const getStatusAuditoria = (pontuacao: number | null, status: string | null) => {
    if (status === 'concluido') {
      return <Badge className="bg-green-500 hover:bg-green-500">Concluída</Badge>;
    } else if (status === 'em_andamento') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Em Andamento</Badge>;
    }
    
    if (!pontuacao) return <Badge className="bg-gray-500 hover:bg-gray-500">Pendente</Badge>;
    
    if (pontuacao > 5) {
      return <Badge className="bg-green-500 hover:bg-green-500">Aprovada</Badge>;
    } else if (pontuacao > 0) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Melhorias Necessárias</Badge>;
    } else {
      return <Badge className="bg-red-500 hover:bg-red-500">Crítica</Badge>;
    }
  };

  const handleEditAuditoria = (auditoriaId: string) => {
    navigate(`/checklist/${auditoriaId}`);
  };

  const handleAuditoriaDeleted = () => {
    window.location.reload();
  };

  if (isLoadingAuditorias) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando auditorias...</p>
      </div>
    );
  }

  if (!auditoriasFiltradas || auditoriasFiltradas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Search className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma auditoria encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {lojaFiltro 
            ? "Não há auditorias para a loja selecionada." 
            : "Não há auditorias realizadas no sistema."}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Loja</TableHead>
          <TableHead>Auditor</TableHead>
          <TableHead>Pontuação</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditoriasFiltradas.map((auditoria) => (
          <TableRow key={auditoria.id}>
            <TableCell>
              {auditoria.data ? format(new Date(auditoria.data), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
            </TableCell>
            <TableCell>{auditoria.loja ? `${auditoria.loja.numero} - ${auditoria.loja.nome}` : 'N/A'}</TableCell>
            <TableCell>{auditoria.usuario?.nome || 'N/A'}</TableCell>
            <TableCell className={`font-medium ${
              auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {auditoria.pontuacao_total ? auditoria.pontuacao_total.toFixed(1) : '0.0'}
            </TableCell>
            <TableCell>
              {getStatusAuditoria(auditoria.pontuacao_total, auditoria.status)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditAuditoria(auditoria.id)}
                  title="Editar auditoria"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/relatorio/${auditoria.id}`)}
                  title="Ver relatório"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <DeleteAuditoriaDialog
                  auditoriaId={auditoria.id}
                  lojaNumero={auditoria.loja?.numero || ''}
                  lojaNome={auditoria.loja?.nome || ''}
                  onDeleted={handleAuditoriaDeleted}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
