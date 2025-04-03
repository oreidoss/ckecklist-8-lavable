
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
}

interface ItemCritico {
  id: string;
  secao_nome: string;
}

interface AnaliseGeralProps {
  pontuacaoTotal: number;
  pontuacoesPorSecao: PontuacaoSecao[];
  itensCriticos: ItemCritico[];
}

export const AnaliseGeral: React.FC<AnaliseGeralProps> = ({ 
  pontuacaoTotal,
  pontuacoesPorSecao,
  itensCriticos
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Geral</CardTitle>
        <CardDescription>Resumo do desempenho da loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Conclusão</h3>
            <p className="text-muted-foreground">
              {pontuacaoTotal && pontuacaoTotal > 5 ? (
                "A loja apresenta um bom desempenho geral, com padrões adequados de qualidade e operação."
              ) : pontuacaoTotal && pontuacaoTotal > 0 ? (
                "A loja apresenta um desempenho satisfatório, porém com algumas áreas que requerem atenção e melhorias."
              ) : (
                "A loja apresenta um desempenho abaixo do esperado. É necessário implementar ações corretivas com urgência."
              )}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fortes</h3>
            {pontuacoesPorSecao.filter(s => s.pontuacao > 0).length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontuacoesPorSecao
                  .filter(s => s.pontuacao > 0)
                  .slice(0, 3)
                  .map(secao => (
                    <li key={secao.id}>{secao.nome}</li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fortes significativos nesta auditoria.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pontos Fracos</h3>
            {pontuacoesPorSecao.filter(s => s.pontuacao < 0).length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pontuacoesPorSecao
                  .filter(s => s.pontuacao < 0)
                  .slice(0, 3)
                  .map(secao => (
                    <li key={secao.id}>{secao.nome}</li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Não foram identificados pontos fracos significativos nesta auditoria.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recomendações</h3>
            <p className="text-muted-foreground">
              {itensCriticos.length > 0 ? (
                `Focar na correção dos ${itensCriticos.length} itens negativos identificados, especialmente nas áreas de ${
                  [...new Set(itensCriticos.slice(0, 3).map(item => item.secao_nome))].join(', ')
                }.`
              ) : (
                "Manter o padrão atual de operação e buscar melhorias contínuas."
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
