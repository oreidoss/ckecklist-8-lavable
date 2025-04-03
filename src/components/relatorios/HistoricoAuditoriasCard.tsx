
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { HistoricoAuditoriasTable } from './HistoricoAuditoriasTable';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Database['public']['Tables']['usuarios']['Row'];
};

interface HistoricoAuditoriasCardProps {
  auditoriasFiltradas?: Auditoria[];
  isLoadingAuditorias: boolean;
  lojaFiltro: string;
  setLojaFiltro: (value: string) => void;
  lojas?: Loja[];
}

export const HistoricoAuditoriasCard: React.FC<HistoricoAuditoriasCardProps> = ({ 
  auditoriasFiltradas,
  isLoadingAuditorias,
  lojaFiltro,
  setLojaFiltro,
  lojas
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Histórico de Auditorias</CardTitle>
          <CardDescription>
            Lista de todas as auditorias realizadas
          </CardDescription>
        </div>
        {lojas && lojas.length > 0 && (
          <Select 
            value={lojaFiltro} 
            onValueChange={setLojaFiltro}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as lojas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas-lojas">Todas as lojas</SelectItem>
              {lojas.map((loja) => (
                <SelectItem key={loja.id} value={loja.id}>
                  {loja.numero} - {loja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <HistoricoAuditoriasTable 
          auditoriasFiltradas={auditoriasFiltradas}
          isLoadingAuditorias={isLoadingAuditorias}
          lojaFiltro={lojaFiltro}
        />
      </CardContent>
    </Card>
  );
};
