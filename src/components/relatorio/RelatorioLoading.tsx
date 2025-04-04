
import React from 'react';
import { Loader2 } from 'lucide-react';

const RelatorioLoading: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-96">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-lg font-medium text-muted-foreground">Carregando relatório...</p>
      <p className="text-sm text-muted-foreground mt-2">
        Estamos preparando os dados do relatório para visualização.
      </p>
    </div>
  );
};

export default RelatorioLoading;
