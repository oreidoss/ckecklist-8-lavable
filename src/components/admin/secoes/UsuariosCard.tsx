
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role?: string;
};

interface UsuariosCardProps {
  usuarios: Usuario[];
  isLoading?: boolean;
}

export const UsuariosCard: React.FC<UsuariosCardProps> = ({ 
  usuarios,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Lista de gerentes e supervisores disponíveis para auditoria
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <RouterLink to="/admin/usuarios">
              <Link className="h-4 w-4 mr-2" />
              Gerenciar
            </RouterLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse">Carregando usuários...</div>
          </div>
        ) : usuarios.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.role ? (
                        <Badge variant={usuario.role === 'gerente' ? 'default' : 'secondary'}>
                          {usuario.role === 'gerente' ? 'Gerente' : 'Supervisora'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não definida</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <UserCheck className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum usuário cadastrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Você pode adicionar usuários na página de gerenciamento de usuários.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
