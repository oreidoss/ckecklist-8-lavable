
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemCritico {
  id: string;
  pergunta_texto: string;
  secao_nome: string;
  observacao: string;
}

interface PontosAtencaoProps {
  itensCriticos: ItemCritico[];
}

export const PontosAtencao: React.FC<PontosAtencaoProps> = ({ itensCriticos }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontos de Atenção</CardTitle>
        <CardDescription>Itens que precisam de melhoria ou correção</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seção</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensCriticos.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.secao_nome}</TableCell>
                <TableCell>{item.pergunta_texto}</TableCell>
                <TableCell>{item.observacao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
