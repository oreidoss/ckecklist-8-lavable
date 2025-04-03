
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Target } from 'lucide-react';

interface PontuacaoPorSecaoProps {
  pontuacoesPorSecao: Array<{
    id: string;
    nome: string;
    pontuacao: number;
    total: number;
    percentual: number;
  }>;
}

export const PontuacaoPorSecao: React.FC<PontuacaoPorSecaoProps> = ({ 
  pontuacoesPorSecao 
}) => {
  if (!pontuacoesPorSecao || pontuacoesPorSecao.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontuação por Seção</CardTitle>
        <CardDescription>Desempenho detalhado por área da loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left border-b font-medium text-gray-700">Seção</th>
                <th className="py-2 px-4 text-center border-b font-medium text-gray-700">Pontuação</th>
                <th className="py-2 px-4 text-center border-b font-medium text-gray-700">
                  Perguntas
                </th>
                <th className="py-2 px-4 text-center border-b font-medium text-gray-700">
                  <div className="flex items-center justify-center">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Meta</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pontuacoesPorSecao.map((secao) => {
                const meta = secao.total + 1;
                const percentual = secao.total > 0 ? (secao.pontuacao / secao.total) * 100 : 0;
                const corPontuacao = secao.pontuacao > 0 
                  ? 'text-green-600' 
                  : secao.pontuacao < 0 ? 'text-red-600' : 'text-gray-600';
                
                return (
                  <tr key={secao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{secao.nome}</td>
                    <td className={`py-3 px-4 text-center font-medium ${corPontuacao}`}>
                      {secao.pontuacao.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {secao.total}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium text-sm">
                        {meta}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              <tr className="bg-gray-50 font-medium">
                <td className="py-3 px-4">TOTAL</td>
                <td className="py-3 px-4 text-center">
                  {pontuacoesPorSecao.reduce((total, secao) => total + secao.pontuacao, 0).toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center">
                  {pontuacoesPorSecao.reduce((total, secao) => total + secao.total, 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                    {pontuacoesPorSecao.reduce((total, secao) => total + secao.total, 0) + 1}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
