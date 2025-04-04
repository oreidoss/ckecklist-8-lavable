
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Usuario } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EditUsuarioDialog } from "./EditUsuarioDialog";
import { DeleteUsuarioDialog } from "./DeleteUsuarioDialog";

interface UsuariosTableProps {
  usuarios: Usuario[];
  onDeleteUsuario: (id: string) => Promise<void>;
  onUpdateUsuario: (usuario: Usuario) => Promise<void>;
  isLoading: boolean;
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  onDeleteUsuario,
  onUpdateUsuario,
  isLoading
}) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell className="font-medium">{usuario.nome}</TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>
              {renderRoleBadge(usuario.role)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <EditUsuarioDialog 
                  usuario={usuario} 
                  onUpdateUsuario={onUpdateUsuario} 
                  isLoading={isLoading} 
                />
                <DeleteUsuarioDialog 
                  usuario={usuario} 
                  onDeleteUsuario={onDeleteUsuario} 
                  isLoading={isLoading} 
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
