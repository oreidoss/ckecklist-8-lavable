
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { db, Loja, Usuario } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';

const NovaAuditoria: React.FC = () => {
  const [lojaId, setLojaId] = useState<string>("");
  const [usuarioId, setUsuarioId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const lojas = db.getLojas();
  const usuarios = db.getUsuarios();
  
  const handleIniciarAuditoria = () => {
    if (!lojaId || !usuarioId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione a loja e o auditor para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Cria uma nova auditoria
    const auditoria = db.addAuditoria({
      loja_id: parseInt(lojaId),
      usuario_id: parseInt(usuarioId),
      data: new Date().toISOString(),
      pontuacao_total: 0
    });
    
    // Redireciona para a página de checklist
    navigate(`/checklist/${auditoria.id}`);
  };
  
  return (
    <div>
      <PageTitle 
        title="Nova Auditoria" 
        description="Selecione a loja e o auditor para iniciar uma nova auditoria"
      />
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Auditoria</CardTitle>
            <CardDescription>
              Preencha as informações para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="loja" className="text-sm font-medium">
                Selecione a Loja
              </label>
              <Select value={lojaId} onValueChange={setLojaId}>
                <SelectTrigger id="loja">
                  <SelectValue placeholder="Escolha uma loja" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja: Loja) => (
                    <SelectItem key={loja.id} value={loja.id.toString()}>
                      {loja.numero} - {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="auditor" className="text-sm font-medium">
                Selecione o Auditor
              </label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger id="auditor">
                  <SelectValue placeholder="Escolha um auditor" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario: Usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleIniciarAuditoria} className="w-full">
              Iniciar Auditoria
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NovaAuditoria;
