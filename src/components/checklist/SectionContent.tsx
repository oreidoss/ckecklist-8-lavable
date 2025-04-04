
import React, { useRef } from 'react';
import { ArrowLeftCircle, ArrowRightCircle, FileText, Paperclip, Save, Upload, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Pergunta, Secao } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  if (!activeSecaoObj) return null;
  
  const lastPerguntaId = perguntasSecaoAtiva.length > 0 
    ? perguntasSecaoAtiva[perguntasSecaoAtiva.length - 1].id 
    : '';
    
  const sectionObservacao = observacoes[lastPerguntaId] || 
    (respostasExistentes?.find(r => r.pergunta_id === lastPerguntaId)?.observacao || '');

  const anexoUrl = fileUrls[lastPerguntaId] || 
    (respostasExistentes?.find(r => r.pergunta_id === lastPerguntaId)?.anexo_url || '');
    
  const isUploading = uploading[lastPerguntaId] || false;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && lastPerguntaId) {
      handleFileUpload(lastPerguntaId, file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Verifica se todas as perguntas obrigatórias foram respondidas
  const hasUnansweredQuestions = () => {
    // As duas últimas perguntas não são obrigatórias (observação e anexo)
    const requiredQuestions = perguntasSecaoAtiva.slice(0, -2);
    return requiredQuestions.some(pergunta => !respostas[pergunta.id]);
  };

  const handlePreviousSection = () => {
    if (isFirstSection) return;
    goToPreviousSection();
  };

  const handleNextSection = () => {
    if (isLastSection) return;
    
    if (hasUnansweredQuestions()) {
      toast({
        title: "Perguntas não respondidas",
        description: "Por favor, responda todas as perguntas obrigatórias antes de avançar.",
        variant: "destructive"
      });
      return;
    }
    
    goToNextSection();
  };

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm">
      <h2 className="text-sm font-bold mb-1">{activeSecaoObj.nome}</h2>
      <div className="text-[10px] text-gray-600 mb-1">
        Seção {secaoIndex + 1} de {totalSecoes}
      </div>
      
      <Progress value={(secaoIndex + 1) / totalSecoes * 100} className="h-1 mb-2" />
      
      <div className="space-y-1">
        {hasUnansweredQuestions() && (
          <div className="bg-amber-50 border border-amber-300 rounded p-2 mb-2 flex items-center gap-2 text-amber-700 text-xs">
            <AlertTriangle className="h-4 w-4" />
            Todas as perguntas são obrigatórias, exceto observações e anexos.
          </div>
        )}
      
        {perguntasSecaoAtiva.map((pergunta, index) => (
          <ChecklistQuestion
            key={pergunta.id}
            pergunta={pergunta}
            index={index}
            resposta={respostas[pergunta.id]}
            handleResposta={handleResposta}
          />
        ))}
        
        <div className="border rounded-lg p-1 bg-gray-50">
          <h3 className="text-xs font-medium mb-1">Observações</h3>
          <div className="flex gap-1">
            <Input
              type="text"
              placeholder="Adicione uma observação"
              className="flex-1 text-xs h-7"
              value={sectionObservacao}
              onChange={(e) => handleObservacaoChange(lastPerguntaId, e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSaveObservacao(lastPerguntaId)}
              className="bg-green-50 hover:bg-green-100 text-green-600 h-7 px-2"
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-1 bg-gray-50">
          <h3 className="text-xs font-medium mb-1">Anexo/Foto</h3>
          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex-1 text-xs h-7"
            >
              {isUploading ? (
                <Upload className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Paperclip className="h-3 w-3 mr-1" />
              )}
              {isUploading ? 'Enviando...' : anexoUrl ? 'Alterar anexo' : 'Adicionar anexo'}
            </Button>
          </div>
          {anexoUrl && (
            <div className="mt-1 text-[10px] text-blue-500 truncate">
              <a href={anexoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {anexoUrl.split('/').pop()}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2 flex flex-col sm:flex-row justify-between gap-1">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousSection}
            disabled={isFirstSection}
            className="flex-1 text-xs h-8"
          >
            <ArrowLeftCircle className="mr-1 h-3 w-3" />
            Anterior
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextSection}
            disabled={isLastSection}
            className="flex-1 text-xs h-8"
          >
            Próxima
            <ArrowRightCircle className="ml-1 h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="default"
            size="sm"
            onClick={saveAndNavigateHome}
            disabled={isSaving}
            className="flex-1 text-xs h-8"
          >
            Salvar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToReport}
            disabled={isSaving}
            className="flex-1 text-xs h-8"
          >
            <FileText className="mr-1 h-3 w-3" />
            Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionContent;
