
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PageTitle } from "@/components/PageTitle";
import { usePerguntas } from '@/hooks/admin/usePerguntas';
import { AddPerguntaDialog } from '@/components/admin/perguntas/AddPerguntaDialog';
import { PerguntasTable } from '@/components/admin/perguntas/PerguntasTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { SectionFilter } from '@/components/admin/perguntas/SectionFilter';

const AdminPerguntas: React.FC = () => {
  const { toast } = useToast();
  
  const { 
    perguntas,
    secoes,
    isLoading,
    isSubmitting,
    perguntaParaEditar,
    setPerguntaParaEditar,
    refetchPerguntas,
    handleAtualizarPergunta,
    handleExcluirPergunta,
    selectedSecaoId,
    setSelectedSecaoId
  } = usePerguntas();
  
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full overflow-hidden">
      <PageTitle 
        title="Gerenciamento de Perguntas" 
        description="Adicione, edite e remova perguntas do checklist"
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
        <SectionFilter
          secoes={secoes}
          selectedSecaoId={selectedSecaoId}
          onSelectSecao={setSelectedSecaoId}
        />
        
        <AddPerguntaDialog 
          secoes={secoes} 
          onPerguntaAdded={refetchPerguntas} 
        />
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className={isMobile ? "px-3 py-4" : ""}>
          <CardTitle>Perguntas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as perguntas disponíveis para o checklist
            {selectedSecaoId && secoes.find(s => s.id === selectedSecaoId) && (
              <> - Filtro: {secoes.find(s => s.id === selectedSecaoId)?.nome}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 py-2" : ""}>
          <ScrollArea className={isMobile ? "h-[calc(100vh-20rem)]" : ""}>
            <PerguntasTable 
              perguntas={perguntas}
              secoes={secoes}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              onPerguntaChange={setPerguntaParaEditar}
              onSavePergunta={handleAtualizarPergunta}
              onDeletePergunta={handleExcluirPergunta}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerguntas;
