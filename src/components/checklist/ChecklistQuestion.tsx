
import React, { useState, useEffect } from 'react';
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
  onResponder: (resposta: RespostaValor) => void;
  onObservacaoChange: (value: string) => void;
  onSaveObservacao: () => void;
  onFileUpload: (file: File) => void;
  isLastPergunta: boolean;
  disabled?: boolean;
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
  disabled = false
}) => {
  const [showObservacoes, setShowObservacoes] = useState(false);
  const [showAnexos, setShowAnexos] = useState(false);
  
  // Efeito para log das props para depuração
  useEffect(() => {
    console.log(`ChecklistQuestion para pergunta ${pergunta.id} - Resposta: ${resposta}, Disabled: ${disabled}`);
  }, [pergunta.id, resposta, disabled]);
  
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
    if (disabled) {
      console.log("Modo desativado: apenas visualizando observações");
    }
    setShowObservacoes(!showObservacoes);
    if (showAnexos) setShowAnexos(false);
  };
  
  // Função para alternar o estado de anexos
  const toggleAnexos = () => {
    if (disabled) {
      console.log("Modo desativado: apenas visualizando anexos");
    }
    setShowAnexos(!showAnexos);
    if (showObservacoes) setShowObservacoes(false);
  };

  // Função para lidar com o clique no botão de resposta
  const handleRespostaClick = (valor: RespostaValor) => {
    console.log(`Clicando em resposta ${valor} para pergunta ${pergunta.id}, disabled=${disabled}`);
    if (!disabled) {
      onResponder(valor);
    } else {
      console.log("Botão desativado, ignorando clique");
    }
  };

  return (
    <div className="bg-gray-50 p-2 rounded-md mb-2">
      <div className="text-xs mb-2">{pergunta.texto}</div>
      
      <div className="flex flex-wrap gap-1">
        {/* Botões de resposta */}
        <div className="flex gap-1 flex-grow">
          {["Sim", "Não", "Regular", "N/A"].map((valor) => (
            <Button
              key={valor}
              variant={getButtonVariant(valor as RespostaValor)}
              className={`px-2 py-0 h-7 text-xs flex-1 ${getButtonColor(valor as RespostaValor)} ${disabled ? 'opacity-80' : ''}`}
              onClick={() => handleRespostaClick(valor as RespostaValor)}
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
            className={`px-2 py-0 h-7 text-xs ${disabled ? 'opacity-80' : ''}`}
            onClick={toggleObservacoes}
          >
            Obs
          </Button>
          
          <Button
            variant="outline"
            className={`px-2 py-0 h-7 text-xs ${disabled ? 'opacity-80' : ''}`}
            onClick={toggleAnexos}
          >
            Anexo
          </Button>
        </div>
      </div>
      
      {/* Campo de observação - sempre visível para visualização, editável apenas se não estiver desativado */}
      {showObservacoes && (
        <ObservacaoField
          perguntaId={pergunta.id}
          observacao={observacao}
          onChange={onObservacaoChange}
          onSave={onSaveObservacao}
          disabled={disabled}
        />
      )}
      
      {/* Campo de anexo - sempre visível para visualização, upload apenas se não estiver desativado */}
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
