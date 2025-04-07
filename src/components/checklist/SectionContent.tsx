
import React from 'react';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import ChecklistQuestion from './ChecklistQuestion';
import ObservacaoField from './ObservacaoField';
import AnexoField from './AnexoField';

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
  isLastPerguntaInSection
}) => {
  const lastPerguntaId = perguntasSecaoAtiva.length > 0 
    ? perguntasSecaoAtiva[perguntasSecaoAtiva.length - 1].id 
    : '';
    
  const sectionObservacao = observacoes[lastPerguntaId] || 
    (respostasExistentes?.find(r => r.pergunta_id === lastPerguntaId)?.observacao || '');

  const anexoUrl = fileUrls[lastPerguntaId] || 
    (respostasExistentes?.find(r => r.pergunta_id === lastPerguntaId)?.anexo_url || '');
    
  const isUploading = uploading[lastPerguntaId] || false;

  return (
    <>
      {perguntasSecaoAtiva.map((pergunta, index) => {
        // Find the response in the state first, then fall back to the existing responses if not in state
        const resposta = respostas[pergunta.id] || 
          (respostasExistentes?.find(r => r.pergunta_id === pergunta.id)?.resposta as RespostaValor);
        
        return (
          <ChecklistQuestion
            key={pergunta.id}
            pergunta={pergunta}
            index={index}
            resposta={resposta}
            handleResposta={handleResposta}
          />
        );
      })}
      
      <ObservacaoField
        perguntaId={lastPerguntaId}
        observacao={sectionObservacao}
        handleObservacaoChange={handleObservacaoChange}
        handleSaveObservacao={handleSaveObservacao}
      />
      
      <AnexoField
        perguntaId={lastPerguntaId}
        anexoUrl={anexoUrl}
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
      />
    </>
  );
};

export default SectionContent;
