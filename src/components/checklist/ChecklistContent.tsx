import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SectionNavigation from '@/components/checklist/SectionNavigation';
import SectionContent from '@/components/checklist/SectionContent';
import SectionNavigationButtons from '@/components/checklist/SectionNavigationButtons';
import ChecklistActions from '@/components/checklist/ChecklistActions';
import SectionWarning from '@/components/checklist/SectionWarning';
import SignatureDialog from '@/components/checklist/SignatureDialog';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklistSave } from '@/hooks/checklist/useChecklistSave';
import { useCompletionPercentage } from '@/hooks/checklist/useCompletionPercentage';

interface ChecklistContentProps {
  activeSecao: string | null;
  secoes: any[] | undefined;
  perguntas: any[] | undefined;
  respostas: Record<string, RespostaValor>;
  observacoes: Record<string, string>;
  uploading: Record<string, boolean>;
  fileUrls: Record<string, string>;
  respostasExistentes: any[] | undefined;
  completedSections: string[];
  incompleteSections: string[];
  isSaving: boolean;
  isSendingEmail?: boolean;
  isEditingActive?: boolean;
  toggleEditMode?: () => void;
  supervisor: string;
  gerente: string;
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

const ChecklistContent: React.FC<ChecklistContentProps> = ({
  activeSecao,
  secoes,
  perguntas,
  respostas,
  observacoes,
  uploading,
  fileUrls,
  respostasExistentes,
  completedSections,
  incompleteSections,
  isSaving,
  isSendingEmail,
  isEditingActive = true,
  toggleEditMode,
  supervisor,
  gerente,
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
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [isFinalizingWithSignatures, setIsFinalizingWithSignatures] = useState(false);
  
  const activeSecaoObj = secoes?.find(s => s.id === activeSecao);
  const perguntasSecaoAtiva = getPerguntasBySecao(activeSecao || '');
  const secaoIndex = secoes?.findIndex(s => s.id === activeSecao) || 0;
  const totalSecoes = secoes?.length || 0;
  const isFirstSection = secaoIndex === 0;
  const isLastSection = secaoIndex === totalSecoes - 1;

  // Use completion percentage hook
  const { completionPercentages } = useCompletionPercentage({
    secoes,
    perguntas,
    respostas
  });

  // Check if checklist is complete (all sections have answers)
  const isChecklistComplete = incompleteSections.length === 0 && completedSections.length > 0;

  if (!activeSecaoObj) return null;
  
  const { sendReportEmail, saveAndNavigateHome: saveAndNavigateHomeBase } = useChecklistSave(auditoriaId);

  const handleSendEmail = async () => {
    if (!reportRef.current) return;
    await sendReportEmail(activeSecaoObj.nome, reportRef);
  };

  const handleNextSection = async () => {
    console.log("ChecklistContent: handleNextSection chamado");
    
    if (saveAndNavigateToNextSection) {
      console.log("Usando saveAndNavigateToNextSection");
      return await saveAndNavigateToNextSection();
    } else {
      console.log("Usando goToNextSection direto");
      goToNextSection();
      return true;
    }
  };

  const handleSaveAndNavigateHome = () => {
    if (isChecklistComplete && isEditingActive) {
      // If checklist is complete, show signature dialog
      setShowSignatureDialog(true);
    } else {
      // Otherwise, just save normally
      saveAndNavigateHome();
    }
  };

  const handleSignatureConfirm = async (supervisorSignature: string, gerenteSignature: string) => {
    setIsFinalizingWithSignatures(true);
    
    try {
      // Save signatures and finalize audit
      await saveAndNavigateHomeBase(respostasExistentes || [], supervisorSignature, gerenteSignature);
      setShowSignatureDialog(false);
    } catch (error) {
      console.error('Error finalizing with signatures:', error);
    } finally {
      setIsFinalizingWithSignatures(false);
    }
  };
  
  return (
    <div ref={reportRef}>
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <SectionNavigation
          secoes={secoes || []}
          activeSecao={activeSecao}
          completedSections={completedSections}
          incompleteSections={incompleteSections}
          setActiveSecao={handleSetActiveSecao}
          completionPercentages={completionPercentages}
        />
      </div>
      
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h2 className="text-sm font-bold mb-1">{activeSecaoObj.nome}</h2>
        <div className="text-[10px] text-gray-600 mb-1">
          Seção {secaoIndex + 1} de {totalSecoes}
        </div>
        
        {hasUnansweredQuestions() && isEditingActive && <SectionWarning />}
        
        <div className="space-y-1">
          <SectionContent
            perguntasSecaoAtiva={perguntasSecaoAtiva}
            respostas={respostas}
            observacoes={observacoes}
            fileUrls={fileUrls}
            uploading={uploading}
            respostasExistentes={respostasExistentes}
            handleResposta={handleResposta}
            handleObservacaoChange={handleObservacaoChange}
            handleSaveObservacao={handleSaveObservacao}
            handleFileUpload={handleFileUpload}
            isLastPerguntaInSection={isLastPerguntaInSection}
            isEditingActive={isEditingActive}
            toggleEditMode={toggleEditMode}
          />
        </div>
        
        <div className="mt-2 flex flex-col sm:flex-row justify-between gap-1">
          <SectionNavigationButtons 
            isFirstSection={isFirstSection}
            isLastSection={isLastSection}
            handlePreviousSection={goToPreviousSection}
            handleNextSection={handleNextSection}
            hasUnansweredQuestions={hasUnansweredQuestions}
            saveResponses={saveAllResponses}
            showSaveButton={isEditingActive}
          />
          
          <ChecklistActions 
            auditoriaId={auditoriaId}
            saveAndNavigateHome={handleSaveAndNavigateHome}
            isSaving={isSaving}
            isSendingEmail={isSendingEmail}
            isEditingActive={isEditingActive}
            onSendEmail={handleSendEmail}
            isChecklistComplete={isChecklistComplete}
          />
        </div>
      </div>

      <SignatureDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        supervisorName={supervisor}
        gerenteName={gerente}
        onConfirm={handleSignatureConfirm}
        isLoading={isFinalizingWithSignatures}
      />
    </div>
  );
};

export default ChecklistContent;
