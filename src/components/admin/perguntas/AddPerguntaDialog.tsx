
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
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Secao } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface AddPerguntaDialogProps {
  secoes: Secao[];
  onPerguntaAdded: () => void;
}

export function AddPerguntaDialog({ secoes, onPerguntaAdded }: AddPerguntaDialogProps) {
  const [novaPergunta, setNovaPergunta] = useState({ secao_id: '', texto: '' });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAdicionarPergunta = async () => {
    if (!novaPergunta.secao_id || !novaPergunta.texto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a seção e o texto da pergunta.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('perguntas')
        .insert([{
          secao_id: novaPergunta.secao_id,
          texto: novaPergunta.texto
        }]);
      
      if (error) throw error;
      
      setNovaPergunta({ secao_id: '', texto: '' });
      onPerguntaAdded();
      
      toast({
        title: "Pergunta adicionada",
        description: "A pergunta foi adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar pergunta:", error);
      toast({
        title: "Erro ao adicionar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar a pergunta.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar uma nova pergunta.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secao" className="text-right">
              Seção
            </Label>
            <Select 
              value={novaPergunta.secao_id} 
              onValueChange={(value) => setNovaPergunta({ ...novaPergunta, secao_id: value })}
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
            <Label htmlFor="texto" className="text-right">
              Pergunta
            </Label>
            <div className="col-span-3">
              <Input
                id="texto"
                value={novaPergunta.texto}
                onChange={(e) => setNovaPergunta({ ...novaPergunta, texto: e.target.value })}
                placeholder="A loja está limpa e sem poeira?"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleAdicionarPergunta} disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
