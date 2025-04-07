
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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ItemCritico {
  id: string;
  pergunta_texto: string;
  secao_nome: string;
  observacao: string;
  pontuacao: number;
}

interface PontosAtencaoProps {
  itensCriticos: ItemCritico[];
}

export const PontosAtencao: React.FC<PontosAtencaoProps> = ({ itensCriticos }) => {
  if (!itensCriticos || itensCriticos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pontos de Atenção</CardTitle>
          <CardDescription>Itens que precisam de melhoria ou correção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-green-50 rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhum ponto de atenção identificado</h3>
            <p className="text-sm text-muted-foreground">
              Todos os itens da auditoria estão em conformidade.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separar itens críticos (-1) dos itens de atenção (0 e 0.5)
  const itensCriticosNegativo = itensCriticos.filter(item => item.pontuacao === -1);
  const itensAtencaoZero = itensCriticos.filter(item => item.pontuacao === 0);
  const itensAtencaoMedio = itensCriticos.filter(item => item.pontuacao === 0.5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontos de Atenção</CardTitle>
        <CardDescription>Itens que precisam de melhoria ou correção</CardDescription>
      </CardHeader>
      <CardContent>
        {itensCriticosNegativo.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-red-700">Pontos Críticos (-1)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seção</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensCriticosNegativo.map((item) => (
                  <TableRow key={item.id} className="bg-red-50">
                    <TableCell className="font-medium">
                      <Badge variant="destructive">{item.secao_nome}</Badge>
                    </TableCell>
                    <TableCell>{item.pergunta_texto}</TableCell>
                    <TableCell>{item.observacao || "Sem observação"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {itensAtencaoZero.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-yellow-700">Pontos de Atenção (0)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seção</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensAtencaoZero.map((item) => (
                  <TableRow key={item.id} className="bg-yellow-50">
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {item.secao_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.pergunta_texto}</TableCell>
                    <TableCell>{item.observacao || "Sem observação"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {itensAtencaoMedio.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
              <h3 className="text-lg font-medium text-amber-600">Pontos Regulares (0.5)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seção</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensAtencaoMedio.map((item) => (
                  <TableRow key={item.id} className="bg-amber-50">
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        {item.secao_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.pergunta_texto}</TableCell>
                    <TableCell>{item.observacao || "Sem observação"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
