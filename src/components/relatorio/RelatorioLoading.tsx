
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const RelatorioLoading: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-10rem)] w-full max-w-full overflow-hidden">
      <Loader2 className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-primary animate-spin mb-4`} />
      <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-muted-foreground text-center px-4`}>
        Carregando relatório...
      </p>
      <p className="text-sm text-muted-foreground mt-2 text-center px-4">
        Estamos preparando os dados do relatório para visualização.
      </p>
    </div>
  );
};

export default RelatorioLoading;
