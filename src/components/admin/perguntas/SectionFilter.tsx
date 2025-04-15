
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Secao } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

interface SectionFilterProps {
  secoes: Secao[];
  selectedSecaoId: string | null;
  onSelectSecao: (secaoId: string | null) => void;
}

export function SectionFilter({ 
  secoes, 
  selectedSecaoId, 
  onSelectSecao 
}: SectionFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="secao-filter" className="text-sm">Filtrar por seção:</Label>
      </div>
      <Select
        value={selectedSecaoId || 'all'}
        onValueChange={(value) => onSelectSecao(value === 'all' ? null : value)}
      >
        <SelectTrigger id="secao-filter" className="w-[200px]">
          <SelectValue placeholder="Todas as seções" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as seções</SelectItem>
          {secoes.map((secao) => (
            <SelectItem key={secao.id} value={secao.id}>
              {secao.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
