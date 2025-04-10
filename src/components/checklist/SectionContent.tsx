
import React, { useEffect } from 'react';
import ChecklistQuestion, { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';
import { Pergunta } from '@/lib/types';

interface SectionContentProps {
  perguntasSecaoAtiva: Pergunta[];
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
  // Debug para verificar as perguntas e o estado de edição
  useEffect(() => {
    console.log("Perguntas da seção ativa:", perguntasSecaoAtiva);
    console.log("Respostas atuais:", respostas);
    console.log("Estado de edição:", isEditingActive);
  }, [perguntasSecaoAtiva, respostas, isEditingActive]);

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

  if (!perguntasSecaoAtiva || perguntasSecaoAtiva.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Nenhuma pergunta encontrada para esta seção.</p>
      </div>
    );
  }
  
  return (
    <>
      {hasResponses && toggleEditMode && (
        <div className="flex justify-end mb-2">
          <Button 
            onClick={handleToggleEditMode}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" />
            {isEditingActive ? "Desativar Edição" : "Editar Respostas"}
          </Button>
        </div>
      )}
      
      {perguntasSecaoAtiva.map((pergunta) => (
        <ChecklistQuestion
          key={pergunta.id}
          pergunta={pergunta}
          resposta={respostas[pergunta.id]}
          observacao={observacoes[pergunta.id] || ''}
          fileUrl={fileUrls[pergunta.id] || ''}
          isUploading={uploading[pergunta.id] || false}
          onResponder={(resposta) => {
            console.log(`Respondendo pergunta ${pergunta.id} com: ${resposta}, isEditingActive: ${isEditingActive}`);
            if (isEditingActive) {
              handleResposta(pergunta.id, resposta);
            } else {
              console.log("Edição desativada, ignorando resposta");
            }
          }}
          onObservacaoChange={(value) => handleObservacaoChange(pergunta.id, value)}
          onSaveObservacao={() => handleSaveObservacao(pergunta.id)}
          onFileUpload={(file) => handleFileUpload(pergunta.id, file)}
          isLastPergunta={isLastPerguntaInSection(pergunta.id)}
          disabled={!isEditingActive}
        />
      ))}
    </>
  );
};

export default SectionContent;
