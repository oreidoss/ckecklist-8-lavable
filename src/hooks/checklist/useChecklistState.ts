
import { useState } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook to manage the state of a checklist
 */
export const useChecklistState = () => {
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState<number>(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  return {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    setObservacoes,
    uploading,
    setUploading,
    fileUrls,
    setFileUrls,
    isSaving,
    setIsSaving
  };
};
