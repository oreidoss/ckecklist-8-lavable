
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';

interface ObservacaoFieldProps {
  perguntaId: string;
  observacao: string;
  handleObservacaoChange: (perguntaId: string, value: string) => void;
  handleSaveObservacao: (perguntaId: string) => void;
}

const ObservacaoField: React.FC<ObservacaoFieldProps> = ({
  perguntaId,
  observacao,
  handleObservacaoChange,
  handleSaveObservacao
}) => {
  return (
    <div className="border rounded-lg p-1 bg-gray-50">
      <h3 className="text-xs font-medium mb-1">Observações</h3>
      <div className="flex gap-1">
        <Input
          type="text"
          placeholder="Adicione uma observação"
          className="flex-1 text-xs h-7"
          value={observacao}
          onChange={(e) => handleObservacaoChange(perguntaId, e.target.value)}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSaveObservacao(perguntaId)}
          className="bg-green-50 hover:bg-green-100 text-green-600 h-7 px-2"
        >
          <Save className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default ObservacaoField;
