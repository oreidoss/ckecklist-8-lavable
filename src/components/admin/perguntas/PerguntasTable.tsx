
import React, { useState } from 'react';
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
  // Track edited pergunta data
  const [editedPerguntas, setEditedPerguntas] = useState<Record<string, Pergunta>>({});
  
  const getSecaoNome = (secaoId: string) => {
    const secao = secoes.find(s => s.id === secaoId);
    return secao ? secao.nome : 'Seção não encontrada';
  };

  const handlePerguntaChange = (pergunta: Pergunta) => {
    setEditedPerguntas(prev => ({
      ...prev,
      [pergunta.id]: pergunta
    }));
    onPerguntaChange(pergunta);
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
          <TableHead className="w-[80px]">Nº</TableHead>
          <TableHead className="w-[200px]">Seção</TableHead>
          <TableHead>Pergunta</TableHead>
          <TableHead className="text-right w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {perguntas.map((pergunta, index) => {
          const currentPergunta = editedPerguntas[pergunta.id] || pergunta;
          
          return (
            <TableRow key={pergunta.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{getSecaoNome(currentPergunta.secao_id)}</TableCell>
              <TableCell>{currentPergunta.texto}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <EditPerguntaDialog 
                    pergunta={currentPergunta} 
                    secoes={secoes} 
                    onPerguntaChange={onPerguntaChange}
                    onSave={() => onSavePergunta(currentPergunta)}
                    isSubmitting={isSubmitting}
                  />
                  <DeletePerguntaDialog 
                    onDelete={() => onDeletePergunta(pergunta.id)}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
