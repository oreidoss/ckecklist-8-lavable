import React from 'react';
import { ArrowLeftCircle, ArrowRightCircle, FileText, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Pergunta, Secao } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
  if (!activeSecaoObj) return null;
  
  const lastPerguntaId = perguntasSecaoAtiva.length > 0 
    ? perguntasSecaoAtiva[perguntasSecaoAtiva.length - 1].id 
    : '';
    
  const sectionObservacao = observacoes[lastPerguntaId] || 
    (respostasExistentes?.find(r => r.pergunta_id === lastPerguntaId)?.observacao || '');

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-2">{activeSecaoObj.nome}</h2>
      <div className="text-xs text-gray-600 mb-2">
        Seção {secaoIndex + 1} de {totalSecoes}
      </div>
      
      <Progress value={(secaoIndex + 1) / totalSecoes * 100} className="h-1 mb-3" />
      
      <div className="space-y-2">
        {perguntasSecaoAtiva.map((pergunta) => (
          <ChecklistQuestion
            key={pergunta.id}
            pergunta={pergunta}
            resposta={respostas[pergunta.id]}
            handleResposta={handleResposta}
          />
        ))}
        
        <div className="border rounded-lg p-2 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Observações</h3>
          <div className="flex gap-1">
            <Input
              type="text"
              placeholder="Adicione uma observação"
              className="flex-1 text-sm h-8"
              value={sectionObservacao}
              onChange={(e) => handleObservacaoChange(lastPerguntaId, e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSaveObservacao(lastPerguntaId)}
              className="bg-green-50 hover:bg-green-100 text-green-600"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousSection}
            disabled={isFirstSection}
            className="flex-1"
          >
            <ArrowLeftCircle className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSection}
            disabled={isLastSection}
            className="flex-1"
          >
            Próxima
            <ArrowRightCircle className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={saveAndNavigateHome}
            disabled={isSaving}
            className="flex-1"
          >
            Salvar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToReport}
            disabled={isSaving}
            className="flex-1"
          >
            <FileText className="mr-1 h-4 w-4" />
            Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionContent;
