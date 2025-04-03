
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
import { UserCheck } from 'lucide-react';

type Usuario = {
  id: string;
  nome: string;
  email: string;
};

interface UsuariosCardProps {
  usuarios: Usuario[];
}

export const UsuariosCard: React.FC<UsuariosCardProps> = ({ usuarios }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Cadastrados</CardTitle>
        <CardDescription>
          Lista de gerentes e supervisores disponíveis para auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {usuarios.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
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
