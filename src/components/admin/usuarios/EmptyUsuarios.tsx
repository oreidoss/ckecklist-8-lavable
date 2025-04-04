
import { User } from "lucide-react";
import React from "react";

export const EmptyUsuarios: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <User className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Nenhum usuário cadastrado</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Adicione seu primeiro usuário clicando no botão "Novo Usuário".
      </p>
    </div>
  );
};
