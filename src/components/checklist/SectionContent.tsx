
import React from 'react';
import ChecklistQuestion, { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';

interface SectionContentProps {
  perguntasSecaoAtiva: any[];
  respostas: Record<string, RespostaValor>;
  observacoes: Record<string, string>;
  fileUrls: Record<string, string>;
  uploading: Record<string, boolean>;
  respostasExistentes: any[] | undefined;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
  handleObservacaoChange: (perguntaId: string, value: string) => void;
  handleSaveObservacao: (perguntaId: string) => void;
  handleFileUpload: (perguntaId: string, file: File) => void;
  isLastPerguntaInSection: (perguntaId: string) => boolean;
  isEditingActive?: boolean;
  toggleEditMode?: () => void;
}

const SectionContent: React.FC<SectionContentProps> = ({
  perguntasSecaoAtiva,
  respostas,
  observacoes,
  fileUrls,
  uploading,
  respostasExistentes,
  handleResposta,
  handleObservacaoChange,
  handleSaveObservacao,
  handleFileUpload,
  isLastPerguntaInSection,
  isEditingActive = true,
  toggleEditMode
}) => {
  // Verifica se alguma pergunta já foi respondida
  const hasResponses = perguntasSecaoAtiva.some(pergunta => 
    respostas[pergunta.id] !== undefined
  );
  
  const handleToggleEditMode = () => {
    if (toggleEditMode) {
      console.log("Botão de edição clicado");
      toggleEditMode();
    } else {
      console.log("toggleEditMode não foi fornecido");
    }
  };
  
  return (
    <>
      {hasResponses && !isEditingActive && toggleEditMode && (
        <div className="flex justify-end mb-2">
          <Button 
            onClick={handleToggleEditMode}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" />
            Editar Respostas
          </Button>
        </div>
      )}
      
      {perguntasSecaoAtiva.map((pergunta, index) => (
        <ChecklistQuestion
          key={pergunta.id}
          pergunta={pergunta}
          resposta={respostas[pergunta.id]}
          observacao={observacoes[pergunta.id] || ''}
          fileUrl={fileUrls[pergunta.id] || ''}
          isUploading={uploading[pergunta.id] || false}
          onResponder={handleResposta}
          onObservacaoChange={handleObservacaoChange}
          onSaveObservacao={handleSaveObservacao}
          onFileUpload={handleFileUpload}
          isLastPergunta={isLastPerguntaInSection(pergunta.id)}
          disabled={!isEditingActive}
          questionNumber={index + 1}
        />
      ))}
    </>
  );
};

export default SectionContent;
