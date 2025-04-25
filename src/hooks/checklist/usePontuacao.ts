
export const usePontuacao = () => {
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  return {
    pontuacaoMap
  };
};
