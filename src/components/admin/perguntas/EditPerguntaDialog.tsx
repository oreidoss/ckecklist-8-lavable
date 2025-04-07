
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
import { Textarea } from '@/components/ui/textarea';

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
  // Create a local state to manage pergunta data during editing
  const [localPergunta, setLocalPergunta] = useState<Pergunta>(pergunta);
  const [isOpen, setIsOpen] = useState(false);
  
  // Reset local state when dialog opens with the current pergunta
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalPergunta(pergunta);
    }
    setIsOpen(open);
  };

  // Update local state
  const handleChange = (field: keyof Pergunta, value: string) => {
    setLocalPergunta(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit changes
  const handleSave = () => {
    onPerguntaChange(localPergunta);
    onSave();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              value={localPergunta.secao_id.toString()} 
              onValueChange={(value) => handleChange('secao_id', value)}
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
              <Textarea
                id="edit-texto"
                value={localPergunta.texto}
                onChange={(e) => handleChange('texto', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
