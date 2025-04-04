
import useUserSelectors from '@/components/checklist/UserSelectors';

type UseUserSelectorHandlersProps = {
  auditoriaId: string | undefined;
  supervisor: string;
  gerente: string;
  isEditingSupervisor: boolean;
  isEditingGerente: boolean;
  usuarios: any[];
  setIsEditingSupervisor: (value: boolean) => void;
  setIsEditingGerente: (value: boolean) => void;
  setSupervisor: (value: string) => void;
  setGerente: (value: string) => void;
  refetchAuditoria: () => void;
};

export const useUserSelectorHandlers = (props: UseUserSelectorHandlersProps) => {
  const {
    auditoriaId,
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    usuarios,
    setIsEditingSupervisor,
    setIsEditingGerente,
    setSupervisor,
    setGerente,
    refetchAuditoria
  } = props;

  return useUserSelectors({
    auditoriaId, 
    supervisor, 
    gerente, 
    isEditingSupervisor, 
    isEditingGerente, 
    usuarios, 
    setIsEditingSupervisor, 
    setIsEditingGerente, 
    setSupervisor, 
    setGerente,
    refetchAuditoria
  });
};
