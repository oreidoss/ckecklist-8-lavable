
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Store, 
  User, 
  Calendar, 
  Edit,
  Download,
} from 'lucide-react';
import { InformacoesGerais } from './InformacoesGerais';
import { PontuacaoPorSecao } from './PontuacaoPorSecao';
import { PontosAtencao } from './PontosAtencao';
import { AnaliseGeral } from './AnaliseGeral';

// PDF export options
const options = {
  margin: 1,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
};

interface RelatorioDetalhadoProps {
  auditoria: any;
  secoes: any[];
  perguntas: any[];
  refetchAuditoria: () => void;
}

export const RelatorioDetalhado: React.FC<RelatorioDetalhadoProps> = ({ 
  auditoria, 
  secoes, 
  perguntas,
  refetchAuditoria
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gerente, setGerente] = useState(auditoria.gerente || '');
  const [supervisor, setSupervisor] = useState(auditoria.usuario?.nome || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Calculate section scores from audit responses
  const calcularPontuacaoPorSecao = () => {
    if (!auditoria.respostas || !secoes || !perguntas) return [];
    
    // Group questions by section
    const perguntasPorSecao = perguntas.reduce((acc, pergunta) => {
      if (!acc[pergunta.secao_id]) {
        acc[pergunta.secao_id] = [];
      }
      acc[pergunta.secao_id].push(pergunta);
      return acc;
    }, {} as Record<string, typeof perguntas>);
    
    // Calculate score for each section
    return secoes.map(secao => {
      const perguntasSecao = perguntasPorSecao[secao.id] || [];
      const respostasSecao = auditoria.respostas.filter(resposta => 
        perguntasSecao.some(pergunta => pergunta.id === resposta.pergunta_id)
      );
      
      let pontuacao = 0;
      respostasSecao.forEach(resposta => {
        if (resposta.resposta === 'sim') pontuacao += 1;
        else if (resposta.resposta === 'nao') pontuacao -= 1;
        // 'N/A' doesn't affect score
      });
      
      return {
        id: secao.id,
        nome: secao.nome,
        pontuacao: pontuacao,
        total: respostasSecao.length,
        percentual: respostasSecao.length > 0 
          ? (pontuacao / respostasSecao.length) * 100 
          : 0
      };
    });
  };

  // Get items that need attention (negative score)
  const getItensCriticos = () => {
    if (!auditoria.respostas || !perguntas) return [];
    
    return auditoria.respostas
      .filter(resposta => resposta.resposta === 'nao')
      .map(resposta => {
        const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
        const secao = secoes?.find(s => s.id === pergunta?.secao_id);
        return {
          id: resposta.id,
          pergunta_texto: pergunta?.texto || 'Pergunta não encontrada',
          secao_nome: secao?.nome || 'Seção não encontrada',
          observacao: resposta.resposta === 'nao' ? 'Item não conforme' : ''
        };
      });
  };

  // Update manager and supervisor information
  const atualizarInformacoes = async () => {
    if (!auditoria) return;
    
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({
          gerente: gerente,
          supervisor: supervisor
        })
        .eq('id', auditoria.id);
      
      if (error) throw error;
      
      toast({
        title: "Informações atualizadas",
        description: "Os dados da auditoria foram atualizados com sucesso!",
      });
      
      setDialogOpen(false);
      refetchAuditoria();
    } catch (error) {
      console.error('Error updating audit information:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações.",
        variant: "destructive"
      });
    }
  };

  // Generate and download PDF
  const exportarPDF = () => {
    if (!reportRef.current) return;
    
    // Clone the report element to modify it for PDF
    const element = reportRef.current.cloneNode(true) as HTMLElement;
    
    // Add some styling for the PDF
    const style = document.createElement('style');
    style.innerHTML = `
      body { font-family: 'Helvetica', 'Arial', sans-serif; }
      .pdf-header { text-align: center; margin-bottom: 20px; }
      .pdf-logo { font-size: 24px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .section-title { margin-top: 20px; font-size: 16px; font-weight: bold; }
      .negative-score { color: red; }
    `;
    element.appendChild(style);
    
    // Convert to PDF and download
    html2pdf().set(options).from(element).save();
    
    toast({
      title: "PDF Exportado",
      description: "O relatório foi exportado com sucesso!",
    });
  };

  const pontuacoesPorSecao = calcularPontuacaoPorSecao();
  const itensCriticos = getItensCriticos();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex space-x-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar Informações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Informações da Auditoria</DialogTitle>
                <DialogDescription>
                  Atualize os dados do gerente e supervisor desta auditoria.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="gerente">Nome do Gerente</Label>
                  <Input
                    id="gerente"
                    value={gerente}
                    onChange={(e) => setGerente(e.target.value)}
                    placeholder="Digite o nome do gerente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Nome do Supervisor</Label>
                  <Input
                    id="supervisor"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="Digite o nome do supervisor"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={atualizarInformacoes}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportarPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>
      
      <div ref={reportRef} className="space-y-6">
        <PageTitle 
          title="Relatório de Auditoria"
          description="Resumo completo da auditoria realizada"
        />
        
        <InformacoesGerais auditoria={auditoria} />
        
        <PontuacaoPorSecao pontuacoesPorSecao={pontuacoesPorSecao} />
        
        {itensCriticos.length > 0 && (
          <PontosAtencao itensCriticos={itensCriticos} />
        )}
        
        <AnaliseGeral 
          pontuacaoTotal={auditoria.pontuacao_total} 
          pontuacoesPorSecao={pontuacoesPorSecao}
          itensCriticos={itensCriticos}
        />
      </div>
    </div>
  );
};
