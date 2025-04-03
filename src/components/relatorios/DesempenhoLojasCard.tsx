
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DesempenhoLojasChart } from './DesempenhoLojasChart';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];

interface DesempenhoLojasCardProps {
  dadosGrafico: { nome: string; pontuacao: number }[];
  lojas?: Loja[];
}

export const DesempenhoLojasCard: React.FC<DesempenhoLojasCardProps> = ({ 
  dadosGrafico,
  lojas
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho das Lojas</CardTitle>
        <CardDescription>
          Pontuação média das auditorias por loja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DesempenhoLojasChart dadosGrafico={dadosGrafico} lojas={lojas} />
      </CardContent>
    </Card>
  );
};
