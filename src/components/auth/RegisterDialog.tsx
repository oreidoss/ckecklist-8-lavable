
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { RegisterForm } from './RegisterForm';

interface RegisterDialogProps {
  onRegisterSuccess: (nome: string, senha: string) => void;
}

export const RegisterDialog = ({ onRegisterSuccess }: RegisterDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-2">
          Cadastrar-se
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar nova conta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para se cadastrar no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <RegisterForm onSuccess={onRegisterSuccess} />
      </DialogContent>
    </Dialog>
  );
};
