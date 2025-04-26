
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ObservacaoFieldProps {
  observacao: string;
  onChange: (value: string) => void;
  onSave: () => void;
  disabled?: boolean;
  perguntaId?: string; // Make perguntaId optional to maintain backward compatibility
}

const ObservacaoField: React.FC<ObservacaoFieldProps> = ({
  observacao,
  onChange,
  onSave,
  disabled = false,
  perguntaId = '' // Provide default value
}) => {
  return (
    <div className="mt-2 space-y-1">
      <textarea
        className={`w-full p-2 text-xs border rounded focus:outline-none focus:ring-2 ${
          disabled ? 'bg-gray-100' : 'focus:ring-[#00bfa5]'
        }`}
        rows={2}
        value={observacao}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite sua observação aqui..."
        disabled={disabled}
      />
      
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          className="text-xs h-7 border-[#00bfa5] text-[#00bfa5] py-0"
        >
          <Save className="h-3 w-3 mr-1" />
          Salvar observação
        </Button>
      )}
    </div>
  );
};

export default ObservacaoField;
