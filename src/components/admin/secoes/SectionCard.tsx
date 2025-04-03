
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { SectionTable } from './SectionTable';

type Secao = {
  id: string;
  nome: string;
};

type Pergunta = {
  id: string;
  texto: string;
  secao_id: string;
};

interface SectionCardProps {
  secoes: Secao[];
  isLoading: boolean;
  perguntas: Pergunta[];
}

export const SectionCard: React.FC<SectionCardProps> = ({ secoes, isLoading, perguntas }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seções Cadastradas</CardTitle>
        <CardDescription>
          Lista de todas as seções disponíveis para o checklist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SectionTable 
          secoes={secoes} 
          isLoading={isLoading} 
          perguntas={perguntas} 
        />
      </CardContent>
    </Card>
  );
};
