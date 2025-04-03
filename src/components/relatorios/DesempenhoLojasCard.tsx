
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DesempenhoLojasChart } from './DesempenhoLojasChart';
import { Database } from '@/integrations/supabase/types';
import { useToast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';

type Loja = Database['public']['Tables']['lojas']['Row'];

interface DesempenhoLojasCardProps {
  dadosGrafico: { nome: string; pontuacao: number }[];
  lojas?: Loja[];
  onExportPDF?: () => void;
}

export const DesempenhoLojasCard: React.FC<DesempenhoLojasCardProps> = ({ 
  dadosGrafico,
  lojas,
  onExportPDF
}) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      // Exportação direta do gráfico se não houver callback
      const element = document.querySelector('.desempenho-lojas-card');
      
      if (!element) return;
      
      const options = {
        margin: 1,
        filename: 'desempenho-lojas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'landscape' }
      };
      
      html2pdf().set(options).from(element).save();
      
      toast({
        title: "PDF Exportado",
        description: "O gráfico de desempenho foi exportado com sucesso!",
      });
    }
  };

  return (
    <Card className="desempenho-lojas-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Desempenho das Lojas</CardTitle>
          <CardDescription>
            Pontuação média das auditorias por loja
          </CardDescription>
        </div>
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </CardHeader>
      <CardContent>
        <DesempenhoLojasChart dadosGrafico={dadosGrafico} lojas={lojas} />
      </CardContent>
    </Card>
  );
};
