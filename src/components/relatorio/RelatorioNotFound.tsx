
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const RelatorioNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">Relatório não encontrado</h2>
      <p className="mb-6">O relatório ou loja solicitado não foi encontrado no sistema.</p>
      <Button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Voltar
      </Button>
    </div>
  );
};

export default RelatorioNotFound;
