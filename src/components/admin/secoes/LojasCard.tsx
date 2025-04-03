
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store } from 'lucide-react';

type Loja = {
  id: string;
  nome: string;
  numero: string;
};

interface LojasCardProps {
  lojas: Loja[];
}

export const LojasCard: React.FC<LojasCardProps> = ({ lojas }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lojas Cadastradas</CardTitle>
        <CardDescription>
          Lista de todas as lojas disponíveis para auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lojas.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.map((loja) => (
                  <TableRow key={loja.id}>
                    <TableCell className="font-medium">{loja.nome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Store className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma loja cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Você pode adicionar lojas na página de gerenciamento de lojas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
