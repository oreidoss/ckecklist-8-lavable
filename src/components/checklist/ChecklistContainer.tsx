
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import ChecklistHeader from '@/components/checklist/ChecklistHeader';
import ChecklistContent from '@/components/checklist/ChecklistContent';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

interface ChecklistContainerProps {
  isLoading: boolean;
  auditoria: any;
  secoes: any[] | undefined;
  perguntas: any[] | undefined;
  respostas: Record<string, RespostaValor>;
  observacoes: Record<string, string>;
  uploading: Record<string, boolean>;
  fileUrls: Record<string, string>;
  respostasExistentes: any[] | undefined;
  supervisor: string;
  gerente: string;
  isEditingSupervisor: boolean;
  isEditingGerente: boolean;
  currentDate: string;
  activeSecao: string | null;
  progresso: number;
  completedSections: string[];
  incompleteSections: string[];
  isSaving: boolean;
  usuarios: any[];
  isEditingActive?: boolean;
  toggleEditMode?: () => void;
  setIsEditingSupervisor: (value: boolean) => void;
  setIsEditingGerente: (value: boolean) => void;
  setSupervisor: (value: string) => void;
  setGerente: (value: string) => void;
  handleSaveSupervisor: () => void;
  handleSaveGerente: () => void;
  getPerguntasBySecao: (secaoId: string) => any[];
  handleSetActiveSecao: (secaoId: string) => void;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
  handleObservacaoChange: (perguntaId: string, value: string) => void;
  handleSaveObservacao: (perguntaId: string) => void;
  handleFileUpload: (perguntaId: string, file: File) => void;
  goToPreviousSection: () => void;
  goToNextSection: () => void;
  hasUnansweredQuestions: () => boolean;
  isLastPerguntaInSection: (perguntaId: string) => boolean;
  saveAndNavigateHome: () => void;
  saveAllResponses: () => Promise<void>;
  pontuacaoPorSecao?: Record<string, number>;
  saveAndNavigateToNextSection?: () => Promise<boolean>;
}

const ChecklistContainer: React.FC<ChecklistContainerProps> = ({
  isLoading,
  auditoria,
  secoes,
  perguntas,
  respostas,
  observacoes,
  uploading,
  fileUrls,
  respostasExistentes,
  supervisor,
  gerente,
  isEditingSupervisor,
  isEditingGerente,
  currentDate,
  activeSecao,
  progresso,
  completedSections,
  incompleteSections,
  isSaving,
  usuarios,
  isEditingActive,
  toggleEditMode,
  setIsEditingSupervisor,
  setIsEditingGerente,
  setSupervisor,
  setGerente,
  handleSaveSupervisor,
  handleSaveGerente,
  getPerguntasBySecao,
  handleSetActiveSecao,
  handleResposta,
  handleObservacaoChange,
  handleSaveObservacao,
  handleFileUpload,
  goToPreviousSection,
  goToNextSection,
  hasUnansweredQuestions,
  isLastPerguntaInSection,
  saveAndNavigateHome,
  saveAllResponses,
  pontuacaoPorSecao,
  saveAndNavigateToNextSection
}) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <ChecklistHeader
        lojaName={auditoria?.loja?.nome || ''}
        lojaNumero={auditoria?.loja?.numero || ''}
        progresso={progresso}
        currentDate={currentDate}
        supervisor={supervisor}
        gerente={gerente}
        isEditingSupervisor={isEditingSupervisor}
        isEditingGerente={isEditingGerente}
        usuarios={usuarios || []}
        setIsEditingSupervisor={setIsEditingSupervisor}
        setIsEditingGerente={setIsEditingGerente}
        setSupervisor={setSupervisor}
        setGerente={setGerente}
        handleSaveSupervisor={handleSaveSupervisor}
        handleSaveGerente={handleSaveGerente}
      />
      
      {activeSecao && (
        <ChecklistContent
          activeSecao={activeSecao}
          secoes={secoes}
          perguntas={perguntas}
          respostas={respostas}
          observacoes={observacoes}
          uploading={uploading}
          fileUrls={fileUrls}
          respostasExistentes={respostasExistentes}
          completedSections={completedSections}
          incompleteSections={incompleteSections}
          isSaving={isSaving}
          isEditingActive={isEditingActive}
          toggleEditMode={toggleEditMode}
          getPerguntasBySecao={getPerguntasBySecao}
          handleSetActiveSecao={handleSetActiveSecao}
          handleResposta={handleResposta}
          handleObservacaoChange={handleObservacaoChange}
          handleSaveObservacao={handleSaveObservacao}
          handleFileUpload={handleFileUpload}
          goToPreviousSection={goToPreviousSection}
          goToNextSection={goToNextSection}
          hasUnansweredQuestions={hasUnansweredQuestions}
          isLastPerguntaInSection={isLastPerguntaInSection}
          saveAndNavigateHome={saveAndNavigateHome}
          saveAllResponses={saveAllResponses}
          pontuacaoPorSecao={pontuacaoPorSecao}
          saveAndNavigateToNextSection={saveAndNavigateToNextSection}
        />
      )}
      
      <div className="mt-6 text-center">
        <Button variant="outline" asChild className="border-[#00bfa5] text-[#00bfa5]">
          <Link to="/" className="flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            Voltar para lojas
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ChecklistContainer;
