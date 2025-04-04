
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw } from 'lucide-react';
import { Usuario } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { UserEditForm } from './UserEditForm';
import { validateUserForm } from './userFormValidation';

interface EditUsuarioDialogProps {
  usuario: Usuario;
  onUpdateUsuario: (usuario: Usuario) => Promise<void>;
  isLoading: boolean;
}

export const EditUsuarioDialog: React.FC<EditUsuarioDialogProps> = ({
  usuario,
  onUpdateUsuario,
  isLoading
}) => {
  const [usuarioEditado, setUsuarioEditado] = useState<Usuario>({ ...usuario });
  const { toast } = useToast();
  
  const handleSalvarClick = async (close: () => void) => {
    const validation = validateUserForm(usuarioEditado);
    
    if (!validation.isValid) {
      toast({
        title: "Validação falhou",
        description: validation.errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    console.log("Salvando usuário com função:", usuarioEditado.role);
    await onUpdateUsuario(usuarioEditado);
    close();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setUsuarioEditado({ ...usuario })}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere as informações do usuário conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <UserEditForm 
          usuario={usuarioEditado} 
          onUsuarioChange={setUsuarioEditado} 
        />
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={(e) => {
              // Get the close function from DialogClose context
              const closeButton = e.currentTarget.closest('button');
              const closeEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0
              });
              
              // First handle our logic
              handleSalvarClick(() => {
                // Then trigger the close action
                if (closeButton) {
                  closeButton.dispatchEvent(closeEvent);
                }
              });
            }} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
