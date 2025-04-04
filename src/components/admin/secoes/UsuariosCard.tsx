
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
import { Usuario } from '@/lib/types';

interface UsuariosCardProps {
  usuarios: Usuario[];
  isLoading?: boolean;
}

export const UsuariosCard: React.FC<UsuariosCardProps> = ({ 
  usuarios,
  isLoading = false
}) => {
  // Function to determine role based on email if role property doesn't exist
  const getUserRole = (usuario: Usuario): string | undefined => {
    if (usuario.role) return usuario.role;
    if (usuario.email.includes('supervisor')) return 'supervisor';
    if (usuario.email.includes('gerente')) return 'gerente';
    if (usuario.email.includes('admin')) return 'admin';
    return undefined;
  };

  // Função para exibir a badge correta conforme a função do usuário
  const renderRoleBadge = (role?: string) => {
    if (!role) return <span className="text-muted-foreground text-sm">Não definida</span>;
    
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="bg-purple-600">Administrador</Badge>;
      case 'gerente':
        return <Badge variant="default">Gerente</Badge>;
      case 'supervisor':
        return <Badge variant="secondary">Supervisora</Badge>;
      default:
        return <span className="text-muted-foreground text-sm">Não definida</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Lista de gerentes, supervisores e administradores disponíveis para auditoria
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
                {usuarios.map((usuario) => {
                  const role = getUserRole(usuario);
                  return (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        {renderRoleBadge(role)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
