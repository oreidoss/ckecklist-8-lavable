
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, User } from 'lucide-react';
import { PageTitle } from "@/components/PageTitle";
import { usuarioService } from "@/lib/services/usuarioService";
import { useToast } from '@/hooks/use-toast';
import { Usuario } from "@/lib/types";
import { UsuariosTable } from "@/components/admin/usuarios/UsuariosTable";
import { AddUsuarioDialog } from "@/components/admin/usuarios/AddUsuarioDialog";
import { EmptyUsuarios } from "@/components/admin/usuarios/EmptyUsuarios";

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const carregarUsuarios = async () => {
    setIsLoading(true);
    try {
      const usuariosDB = await usuarioService.getUsuarios();
      setUsuarios(usuariosDB);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar os usuários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    carregarUsuarios();
  }, []);
  
  const handleExcluirUsuario = async (id: string) => {
    try {
      setIsLoading(true);
      await usuarioService.deleteUsuario(id);
      setUsuarios(usuarios.filter(usuario => usuario.id !== id));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário. Verifique se não há auditorias associadas a ele.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAtualizarUsuario = async (usuarioAtualizado: Usuario) => {
    try {
      setIsLoading(true);
      await usuarioService.updateUsuario(usuarioAtualizado);
      
      setUsuarios(usuarios.map(usuario => 
        usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario
      ));
      
      toast({
        title: "Usuário atualizado",
        description: `Usuário ${usuarioAtualizado.nome} foi atualizado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdicionarUsuario = async (novoUsuario: Omit<Usuario, "id">) => {
    try {
      setIsLoading(true);
      const adicionado = await usuarioService.addUsuario(novoUsuario);
      
      setUsuarios([...usuarios, adicionado]);
      
      toast({
        title: "Usuário adicionado",
        description: `Usuário ${adicionado.nome} foi adicionado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({
        title: "Erro ao adicionar usuário",
        description: "Não foi possível adicionar o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Usuários" 
        description="Adicione, edite e remova usuários do sistema"
      />
      
      <div className="flex justify-between items-center mb-6">
        <AddUsuarioDialog onAddUsuario={handleAdicionarUsuario} isLoading={isLoading} />
        
        <Button variant="outline" onClick={carregarUsuarios} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Atualizar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os usuários disponíveis para realizar auditorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : usuarios.length > 0 ? (
            <UsuariosTable 
              usuarios={usuarios} 
              onDeleteUsuario={handleExcluirUsuario} 
              onUpdateUsuario={handleAtualizarUsuario}
              isLoading={isLoading}
            />
          ) : (
            <EmptyUsuarios />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsuarios;
