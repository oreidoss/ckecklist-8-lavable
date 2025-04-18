import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ObservacaoField from '@/components/checklist/ObservacaoField';
import AnexoField from '@/components/checklist/AnexoField';

export type RespostaValor = "Sim" | "Não" | "Regular" | "N/A" | null;

interface ChecklistQuestionProps {
  pergunta: any;
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
  questionNumber
}) => {
  const [showObservacoes, setShowObservacoes] = useState(false);
  const [showAnexos, setShowAnexos] = useState(false);
  
  // Define cores para os botões de resposta
  const getButtonVariant = (value: RespostaValor): "default" | "outline" => {
    return resposta === value ? "default" : "outline";
  };
  
  // Define cores com base na resposta
  const getButtonColor = (value: RespostaValor): string => {
    if (resposta !== value) return "";
    
    switch (value) {
      case "Sim": return "bg-green-500 hover:bg-green-600";
      case "Não": return "bg-red-500 hover:bg-red-600";
      case "Regular": return "bg-amber-500 hover:bg-amber-600";
      case "N/A": return "bg-gray-500 hover:bg-gray-600";
      default: return "";
    }
  };
  
  // Função para alternar o estado de observações
  const toggleObservacoes = () => {
    setShowObservacoes(!showObservacoes);
    if (showAnexos) setShowAnexos(false);
  };
  
  // Função para alternar o estado de anexos
  const toggleAnexos = () => {
    setShowAnexos(!showAnexos);
    if (showObservacoes) setShowObservacoes(false);
  };

  // Log para depuração da resposta atual
  console.log(`Pergunta: ${pergunta.texto} - Resposta: ${resposta} - Disabled: ${disabled}`);

  return (
    <div className="bg-gray-50 p-2 rounded-md mb-2">
      <div className="flex gap-2 items-start mb-2">
        {questionNumber && (
          <span className="text-xs font-medium text-gray-500 min-w-[20px]">
            {questionNumber}.
          </span>
        )}
        <div className="text-xs flex-grow">{pergunta.texto}</div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {/* Botões de resposta */}
        <div className="flex gap-1 flex-grow">
          {["Sim", "Não", "Regular", "N/A"].map((valor) => (
            <Button
              key={valor}
              variant={getButtonVariant(valor as RespostaValor)}
              className={`px-2 py-0 h-7 text-xs flex-1 ${getButtonColor(valor as RespostaValor)}`}
              onClick={() => !disabled && onResponder(pergunta.id, valor as RespostaValor)}
              disabled={disabled}
            >
              {valor}
            </Button>
          ))}
        </div>
        
        {/* Botões de observação e anexo */}
        <div className="flex gap-1 ml-auto">
          <Button
            variant="outline"
            className="px-2 py-0 h-7 text-xs"
            onClick={toggleObservacoes}
          >
            Obs
          </Button>
          
          <Button
            variant="outline"
            className="px-2 py-0 h-7 text-xs"
            onClick={toggleAnexos}
          >
            Anexo
          </Button>
        </div>
      </div>
      
      {/* Campo de observação */}
      {showObservacoes && (
        <ObservacaoField
          perguntaId={pergunta.id}
          observacao={observacao}
          onChange={onObservacaoChange}
          onSave={onSaveObservacao}
          disabled={disabled}
        />
      )}
      
      {/* Campo de anexo */}
      {showAnexos && (
        <AnexoField
          perguntaId={pergunta.id}
          fileUrl={fileUrl}
          isUploading={isUploading}
          onFileUpload={onFileUpload}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default ChecklistQuestion;
