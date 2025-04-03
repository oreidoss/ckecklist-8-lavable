
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
            <Card key={secao.id} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{secao.nome}</h3>
                <div className={`text-2xl font-bold mb-2 ${
                  secao.pontuacao > 0 ? 'text-green-500' : 
                  secao.pontuacao < 0 ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {secao.pontuacao.toFixed(1)}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-1 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${
                      secao.pontuacao > 0 ? 'bg-green-500' : 
                      secao.pontuacao < 0 ? 'bg-red-500' : 
                      'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${Math.min(Math.max((secao.pontuacao + 5) * 10, 0), 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {secao.total} {secao.total === 1 ? 'item' : 'itens'} avaliados
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
