
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

const AdminPerguntas: React.FC = () => {
  const { 
    perguntas,
    secoes,
    isLoading,
    isSubmitting,
    perguntaParaEditar,
    setPerguntaParaEditar,
    refetchPerguntas,
    handleAtualizarPergunta,
    handleExcluirPergunta
  } = usePerguntas();
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Perguntas" 
        description="Adicione, edite e remova perguntas do checklist"
      />
      
      <div className="flex justify-end mb-6">
        <AddPerguntaDialog 
          secoes={secoes} 
          onPerguntaAdded={refetchPerguntas} 
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as perguntas disponíveis para o checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerguntasTable 
            perguntas={perguntas}
            secoes={secoes}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            onPerguntaChange={setPerguntaParaEditar}
            onSavePergunta={handleAtualizarPergunta}
            onDeletePergunta={handleExcluirPergunta}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerguntas;
