
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HelpCircle } from 'lucide-react';
import { Pergunta, Secao } from '@/lib/types';
import { EditPerguntaDialog } from './EditPerguntaDialog';
import { DeletePerguntaDialog } from './DeletePerguntaDialog';

interface PerguntasTableProps {
  perguntas: Pergunta[];
  secoes: Secao[];
  isLoading: boolean;
  onPerguntaChange: (pergunta: Pergunta) => void;
  onSavePergunta: (pergunta: Pergunta) => void;
  onDeletePergunta: (id: string) => void;
  isSubmitting?: boolean;
}

export function PerguntasTable({ 
  perguntas, 
  secoes, 
  isLoading,
  onPerguntaChange,
  onSavePergunta,
  onDeletePergunta,
  isSubmitting = false
}: PerguntasTableProps) {
  const getSecaoNome = (secaoId: string) => {
    const secao = secoes.find(s => s.id === secaoId);
    return secao ? secao.nome : 'Seção não encontrada';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-muted-foreground">Carregando perguntas...</p>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma pergunta cadastrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione sua primeira pergunta clicando no botão "Nova Pergunta".
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Seção</TableHead>
          <TableHead>Pergunta</TableHead>
          <TableHead className="text-right w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {perguntas.map((pergunta) => (
          <TableRow key={pergunta.id}>
            <TableCell>{getSecaoNome(pergunta.secao_id)}</TableCell>
            <TableCell>{pergunta.texto}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <EditPerguntaDialog 
                  pergunta={pergunta} 
                  secoes={secoes} 
                  onPerguntaChange={onPerguntaChange}
                  onSave={() => onSavePergunta(pergunta)}
                  isSubmitting={isSubmitting}
                />
                <DeletePerguntaDialog 
                  onDelete={() => onDeletePergunta(pergunta.id)}
                  isSubmitting={isSubmitting}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
