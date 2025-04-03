
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];

interface DesempenhoLojasChartProps {
  dadosGrafico: { nome: string; pontuacao: number }[];
  lojas?: Loja[];
}

export const DesempenhoLojasChart: React.FC<DesempenhoLojasChartProps> = ({ 
  dadosGrafico,
  lojas
}) => {
  const navigate = useNavigate();
  
  const handleVerHistoricoLoja = (lojaId: string) => {
    navigate(`/relatorio/loja/${lojaId}`);
  };
  
  return (
    <div className="h-[300px]">
      {dadosGrafico.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis domain={[-5, 10]} />
            <Tooltip formatter={(value) => [`${value} pontos`, 'Pontuação']} />
            <Bar 
              dataKey="pontuacao" 
              fill="hsl(var(--primary))" 
              name="Pontuação"
              radius={[4, 4, 0, 0]}
              onClick={(data) => {
                const store = lojas?.find(l => `${l.numero} - ${l.nome}` === data.nome);
                if (store) {
                  handleVerHistoricoLoja(store.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Nenhum dado disponível para exibição</p>
        </div>
      )}
    </div>
  );
};
