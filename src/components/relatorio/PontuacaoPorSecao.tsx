
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface PontuacaoSecao {
  id: string;
  nome: string;
  pontuacao: number;
  total: number;
  percentual: number;
}

interface PontuacaoPorSecaoProps {
  pontuacoesPorSecao: PontuacaoSecao[];
}

export const PontuacaoPorSecao: React.FC<PontuacaoPorSecaoProps> = ({ pontuacoesPorSecao }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontuação por Seção</CardTitle>
        <CardDescription>Desempenho detalhado por área avaliada</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pontuacoesPorSecao.map((secao) => (
            <Card key={secao.id}>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{secao.nome}</h3>
                <div className={`text-2xl font-bold ${secao.pontuacao > 0 ? 'text-green-500' : secao.pontuacao < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {secao.pontuacao.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
