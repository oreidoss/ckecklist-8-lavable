import React, { useEffect, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { lojaService } from '@/lib/services/lojaService';
import { Loja } from '@/lib/types';

interface LojasCardProps {
  lojas?: Loja[];
  isLoading?: boolean;
}

export const LojasCard: React.FC<LojasCardProps> = ({ 
  lojas: initialLojas,
  isLoading: initialLoading = false
}) => {
  const [lojas, setLojas] = useState<Loja[]>(initialLojas || []);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  
  useEffect(() => {
    // If lojas were passed as props, use them
    if (initialLojas) {
      setLojas(initialLojas);
      return;
    }
    
    // Otherwise, fetch them from the service
    const fetchLojas = async () => {
      setIsLoading(true);
      try {
        const fetchedLojas = await lojaService.getLojas();
        setLojas(fetchedLojas);
      } catch (error) {
        console.error("Error fetching lojas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLojas();
  }, [initialLojas]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lojas Cadastradas</CardTitle>
            <CardDescription>
              Lista de lojas disponíveis para auditoria
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <RouterLink to="/admin/lojas">
              <Link className="h-4 w-4 mr-2" />
              Gerenciar
            </RouterLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse">Carregando lojas...</div>
          </div>
        ) : lojas.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.map((loja) => (
                  <TableRow key={loja.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{loja.numero}</Badge>
                    </TableCell>
                    <TableCell>{loja.nome}</TableCell>
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
              Adicione lojas na página de gerenciamento de lojas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
