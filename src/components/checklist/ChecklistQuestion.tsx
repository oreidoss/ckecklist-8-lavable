
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AnexoField from '@/components/checklist/AnexoField';
import ObservacaoField from '@/components/checklist/ObservacaoField';

export type RespostaValor = 'Sim' | 'Não' | 'Regular' | 'N/A' | null;

interface ChecklistQuestionProps {
  pergunta: {
    id: string;
    texto: string;
  };
  resposta: RespostaValor;
  observacao: string;
  fileUrl: string;
  isUploading: boolean;
  onResponder: (perguntaId: string, resposta: RespostaValor) => void;
  onObservacaoChange: (perguntaId: string, value: string) => void;
  onSaveObservacao: (perguntaId: string) => void;
  onFileUpload: (perguntaId: string, file: File) => void;
  isLastPergunta: boolean;
  disabled?: boolean;
  questionNumber?: number;
}

const ChecklistQuestion: React.FC<ChecklistQuestionProps> = ({
  pergunta,
  resposta,
  observacao,
  fileUrl,
  isUploading,
  onResponder,
  onObservacaoChange,
  onSaveObservacao,
  onFileUpload,
  isLastPergunta,
  disabled = false,
  questionNumber = 0,
}) => {
  const [showFields, setShowFields] = useState(false);
  
  // Show additional fields when observation or attachment exists
  useEffect(() => {
    if (observacao || fileUrl) {
      setShowFields(true);
    }
  }, [observacao, fileUrl]);

  const handleResponder = (valor: RespostaValor) => {
    console.log(`Respondendo pergunta ${pergunta.id} com valor ${valor}`);
    onResponder(pergunta.id, valor);
    
    // Show additional fields automatically when response is "Não"
    if (valor === 'Não') {
      setShowFields(true);
    }
  };

  const getButtonVariant = (buttonValue: RespostaValor) => {
    if (disabled) {
      return resposta === buttonValue ? "default" : "outline";
    }
    return resposta === buttonValue ? "default" : "outline";
  };

  return (
    <div className="pb-4 mb-4 border-b border-gray-100 last:border-none">
      <div className="font-medium text-sm mb-2">
        {questionNumber > 0 && <span className="inline-block w-7">{questionNumber}.</span>}
        {pergunta.texto}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {['Sim', 'Não', 'Regular'].map((valor) => (
          <Button
            key={valor}
            type="button"
            variant={getButtonVariant(valor as RespostaValor)}
            size="sm"
            onClick={() => handleResponder(valor as RespostaValor)}
            disabled={disabled}
            className={`px-6 ${
              resposta === valor 
                ? valor === 'Sim' 
                  ? 'bg-green-500 hover:bg-green-600'
                  : valor === 'Não'
                    ? 'bg-red-500 hover:bg-red-600'
                    : valor === 'Regular'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : ''
                : ''
            }`}
          >
            {valor}
          </Button>
        ))}
        
        <Button
          type="button"
          variant={getButtonVariant('N/A')}
          size="sm"
          onClick={() => handleResponder('N/A')}
          disabled={disabled}
          className={`${resposta === 'N/A' ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
        >
          N/A
        </Button>
        
        {!showFields && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFields(true)}
            className="text-gray-500 hover:text-black"
          >
            + Adicionar obs/anexo
          </Button>
        )}
      </div>
      
      {showFields && (
        <div className="pl-7 space-y-2">
          <ObservacaoField
            observacao={observacao}
            onChange={(value) => onObservacaoChange(pergunta.id, value)}
            onSave={() => onSaveObservacao(pergunta.id)}
            disabled={disabled}
            perguntaId={pergunta.id}
          />
          
          <AnexoField
            fileUrl={fileUrl}
            onFileUpload={(file) => onFileUpload(pergunta.id, file)}
            isUploading={isUploading}
            disabled={disabled}
            perguntaId={pergunta.id}
          />
        </div>
      )}
    </div>
  );
};

export default ChecklistQuestion;
