
import React from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from 'lucide-react';
import { Pergunta, Secao } from '@/lib/types';

interface EditPerguntaDialogProps {
  pergunta: Pergunta;
  secoes: Secao[];
  onPerguntaChange: (pergunta: Pergunta) => void;
  onSave: () => void;
  isSubmitting?: boolean;
}

export function EditPerguntaDialog({ 
  pergunta, 
  secoes, 
  onPerguntaChange, 
  onSave,
  isSubmitting = false
}: EditPerguntaDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pergunta</DialogTitle>
          <DialogDescription>
            Altere as informações da pergunta conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-secao" className="text-right">
              Seção
            </Label>
            <Select 
              value={pergunta.secao_id.toString()} 
              onValueChange={(value) => onPerguntaChange({ 
                ...pergunta, 
                secao_id: value
              })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma seção" />
              </SelectTrigger>
              <SelectContent>
                {secoes.map((secao) => (
                  <SelectItem key={secao.id} value={secao.id.toString()}>
                    {secao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-texto" className="text-right">
              Pergunta
            </Label>
            <div className="col-span-3">
              <Input
                id="edit-texto"
                value={pergunta.texto}
                onChange={(e) => onPerguntaChange({ 
                  ...pergunta, 
                  texto: e.target.value 
                })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSave} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
