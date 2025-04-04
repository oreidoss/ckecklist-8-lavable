
import React from 'react';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pergunta, Secao } from '@/lib/types';
import ChecklistQuestion, { RespostaValor } from './ChecklistQuestion';

interface SectionContentProps {
  activeSecaoObj: Secao | undefined;
  secaoIndex: number;
  totalSecoes: number;
  perguntasSecaoAtiva: Pergunta[];
  respostas: Record<string, RespostaValor>;
  observacoes: Record<string, string>;
  fileUrls: Record<string, string>;
  uploading: Record<string, boolean>;
  respostasExistentes: any[] | undefined;
  isFirstSection: boolean;
  isLastSection: boolean;
  goToPreviousSection: () => void;
  goToNextSection: () => void;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
  handleObservacaoChange: (perguntaId: string, value: string) => void;
  handleSaveObservacao: (perguntaId: string) => void;
  handleFileUpload: (perguntaId: string, file: File) => void;
  isLastPerguntaInSection: (perguntaId: string) => boolean;
  saveAndNavigateHome: () => void;
  navigateToReport: () => void;
  isSaving: boolean;
}

const SectionContent: React.FC<SectionContentProps> = ({
  activeSecaoObj,
  secaoIndex,
  totalSecoes,
  perguntasSecaoAtiva,
  respostas,
  observacoes,
  fileUrls,
  uploading,
  respostasExistentes,
  isFirstSection,
  isLastSection,
  goToPreviousSection,
  goToNextSection,
  handleResposta,
  handleObservacaoChange,
  handleSaveObservacao,
  handleFileUpload,
  isLastPerguntaInSection,
  saveAndNavigateHome,
  navigateToReport,
  isSaving
}) => {
  if (!activeSecaoObj) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">{activeSecaoObj.nome}</h2>
      <div className="text-sm text-gray-600 mb-4">
        Seção {secaoIndex + 1} de {totalSecoes}
      </div>
      
      <div className="mb-6">
        <Progress value={(secaoIndex + 1) / totalSecoes * 100} className="h-2" />
      </div>
      
      <div className="space-y-8">
        {perguntasSecaoAtiva.map((pergunta, index) => {
          const isLastPergunta = isLastPerguntaInSection(pergunta.id);
          const anexoUrl = respostasExistentes?.find(r => r.pergunta_id === pergunta.id)?.anexo_url || '';
          const observacao = respostasExistentes?.find(r => r.pergunta_id === pergunta.id)?.observacao || '';
          
          return (
            <ChecklistQuestion
              key={pergunta.id}
              pergunta={pergunta}
              index={index}
              resposta={respostas[pergunta.id]}
              isLastPergunta={isLastPergunta}
              observacao={observacoes[pergunta.id] || observacao}
              anexoUrl={fileUrls[pergunta.id] || anexoUrl}
              uploading={uploading[pergunta.id] || false}
              handleResposta={handleResposta}
              handleObservacaoChange={handleObservacaoChange}
              handleSaveObservacao={handleSaveObservacao}
              handleFileUpload={handleFileUpload}
            />
          );
        })}
      </div>
      
      <div className="mt-10 flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousSection}
          disabled={isFirstSection}
          className="flex items-center"
        >
          <ArrowLeftCircle className="mr-2 h-5 w-5" />
          Seção Anterior
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-[#00bfa5] hover:bg-[#00a896] px-6 py-2 h-12"
            onClick={saveAndNavigateHome}
            disabled={isSaving}
          >
            Salvar e Voltar
          </Button>
          
          <Button
            variant="outline"
            className="border-[#00bfa5] text-[#00bfa5] px-6 py-2 h-12"
            onClick={navigateToReport}
            disabled={isSaving}
          >
            Ver Relatório
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={goToNextSection}
          disabled={isLastSection}
          className="flex items-center"
        >
          Próxima Seção
          <ArrowRightCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SectionContent;
