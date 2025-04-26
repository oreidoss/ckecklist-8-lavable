
import React, { useEffect, useState } from 'react';
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
  // Estado local para armazenar respostas existentes mapeadas por ID da pergunta
  const [respostasMap, setRespostasMap] = useState<Record<string, any>>({});
  
  // Processar respostasExistentes para criar um mapa
  useEffect(() => {
    if (respostasExistentes && respostasExistentes.length > 0) {
      console.log("Processando respostas existentes:", respostasExistentes);
      
      // Primeiro, ordenamos por data de criação (mais recente primeiro)
      const sortedRespostas = [...respostasExistentes].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Criar um mapa para armazenar apenas a resposta mais recente para cada pergunta
      const novoMapa: Record<string, any> = {};
      
      sortedRespostas.forEach(resp => {
        const perguntaId = resp.pergunta_id;
        // Só adicionar se ainda não existir uma resposta mais recente para esta pergunta
        if (!novoMapa[perguntaId]) {
          novoMapa[perguntaId] = resp;
        }
      });
      
      console.log("Mapa de respostas criado:", novoMapa);
      setRespostasMap(novoMapa);
    }
  }, [respostasExistentes]);
  
  // Verifica se alguma pergunta já foi respondida
  const hasResponses = perguntasSecaoAtiva.some(pergunta => 
    respostas[pergunta.id] !== undefined || respostasMap[pergunta.id] !== undefined
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
      
      {perguntasSecaoAtiva.map((pergunta, index) => {
        // Buscar resposta do estado ou do mapa de respostas existentes
        const respostaExistente = respostasMap[pergunta.id];
        const respostaAtual = respostas[pergunta.id] || (respostaExistente ? respostaExistente.resposta : null);
        const observacaoAtual = observacoes[pergunta.id] || (respostaExistente ? respostaExistente.observacao || '' : '');
        const fileUrlAtual = fileUrls[pergunta.id] || (respostaExistente ? respostaExistente.anexo_url || '' : '');
        
        return (
          <ChecklistQuestion
            key={pergunta.id}
            pergunta={pergunta}
            resposta={respostaAtual}
            observacao={observacaoAtual}
            fileUrl={fileUrlAtual}
            isUploading={uploading[pergunta.id] || false}
            onResponder={handleResposta}
            onObservacaoChange={handleObservacaoChange}
            onSaveObservacao={handleSaveObservacao}
            onFileUpload={handleFileUpload}
            isLastPergunta={isLastPerguntaInSection(pergunta.id)}
            disabled={!isEditingActive}
            questionNumber={index + 1}
          />
        );
      })}
    </>
  );
};

export default SectionContent;
