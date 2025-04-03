
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  FileText, 
  Store, 
  User, 
  Calendar, 
  Edit,
  Download,
  Clock,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

// For the PDF export
const options = {
  margin: 1,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
};

const Relatorio: React.FC = () => {
  const { auditoriaId, lojaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gerente, setGerente] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Fetch specific audit data if we have an auditoriaId
  const { 
    data: auditoria, 
    isLoading: loadingAuditoria,
    refetch: refetchAuditoria
  } = useQuery({
    queryKey: ['auditoria', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) return null;
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*), respostas(*)')
        .eq('id', auditoriaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!auditoriaId
  });

  // Fetch store audits if we have a lojaId
  const {
    data: auditoriasPorLoja,
    isLoading: loadingAuditoriasPorLoja
  } = useQuery({
    queryKey: ['auditorias-por-loja', lojaId],
    queryFn: async () => {
      if (!lojaId) return null;
      
      const { data: loja, error: lojaError } = await supabase
        .from('lojas')
        .select('*')
        .eq('id', lojaId)
        .single();
      
      if (lojaError) throw lojaError;
      
      const { data: auditorias, error: auditoriasError } = await supabase
        .from('auditorias')
        .select('*, usuario:usuarios(*), respostas(*)')
        .eq('loja_id', lojaId)
        .order('data', { ascending: false });
      
      if (auditoriasError) throw auditoriasError;
      
      return { loja, auditorias };
    },
    enabled: !!lojaId && !auditoriaId
  });

  // Fetch section data for categorizing questions
  const { data: secoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch questions data for displaying question text
  const { data: perguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Setting initial values for gerente and supervisor when data is loaded
  useEffect(() => {
    if (auditoria) {
      setGerente(auditoria.gerente || '');
      setSupervisor(auditoria.usuario?.nome || '');
    }
  }, [auditoria]);

  // Calculate section scores from audit responses
  const calcularPontuacaoPorSecao = () => {
    if (!auditoria?.respostas || !secoes || !perguntas) return [];
    
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
    if (!auditoria?.respostas || !perguntas) return [];
    
    return auditoria.respostas
      .filter(resposta => resposta.resposta === 'nao')
      .map(resposta => {
        const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
        const secao = secoes?.find(s => s.id === pergunta?.secao_id);
        return {
          id: resposta.id,
          pergunta_texto: pergunta?.texto || 'Pergunta não encontrada',
          secao_nome: secao?.nome || 'Seção não encontrada',
          observacao: resposta.observacao || 'Sem observação'
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

  if (loadingAuditoria || loadingAuditoriasPorLoja) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }

  if ((!auditoria && !auditoriasPorLoja) || (lojaId && !auditoriasPorLoja?.loja)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Relatório não encontrado</h2>
        <p className="mb-6">O relatório ou loja solicitado não foi encontrado no sistema.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  // Report for a specific audit
  if (auditoria) {
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
          
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Detalhes da auditoria realizada</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Loja</div>
                <div className="flex items-center text-lg font-bold">
                  <Store className="h-5 w-5 mr-2 text-primary" />
                  {auditoria.loja ? `${auditoria.loja.numero} - ${auditoria.loja.nome}` : 'N/A'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Data da Auditoria</div>
                <div className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {auditoria.data 
                    ? format(new Date(auditoria.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
                    : 'N/A'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Auditor</div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  {auditoria.usuario?.nome || 'N/A'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pontuação Total</div>
                <div className={`text-xl font-bold ${auditoria.pontuacao_total && auditoria.pontuacao_total > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                    ? `${auditoria.pontuacao_total.toFixed(1)} pontos` 
                    : '0 pontos'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Gerente</div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  {auditoria.gerente || 'Não definido'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Supervisor</div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  {auditoria.supervisor || 'Não definido'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pontuação por Seção</CardTitle>
              <CardDescription>Desempenho detalhado por área avaliada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pontuacoesPorSecao.map((secao) => (
                  <Card key={secao.id}>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{secao.nome}</h3>
                      <div className={`text-2xl font-bold ${secao.pontuacao > 0 ? 'text-green-500' : secao.pontuacao < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {secao.pontuacao.toFixed(1)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {itensCriticos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pontos de Atenção</CardTitle>
                <CardDescription>Itens que precisam de melhoria ou correção</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seção</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensCriticos.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.secao_nome}</TableCell>
                        <TableCell>{item.pergunta_texto}</TableCell>
                        <TableCell>{item.observacao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
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
                    {auditoria.pontuacao_total && auditoria.pontuacao_total > 5 ? (
                      "A loja apresenta um bom desempenho geral, com padrões adequados de qualidade e operação."
                    ) : auditoria.pontuacao_total && auditoria.pontuacao_total > 0 ? (
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
        </div>
      </div>
    );
  }
  
  // Report for a store (showing history of audits)
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={exportarPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
      
      <div ref={reportRef} className="space-y-6">
        <PageTitle 
          title={`Histórico: ${auditoriasPorLoja?.loja.numero} - ${auditoriasPorLoja?.loja.nome}`}
          description="Histórico completo de auditorias realizadas nesta loja"
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
            <CardDescription>Detalhes da loja e estatísticas gerais</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <Store className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-xl font-bold">
                  {auditoriasPorLoja?.loja.numero} - {auditoriasPorLoja?.loja.nome}
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Última auditoria: {
                    auditoriasPorLoja?.auditorias && auditoriasPorLoja.auditorias.length > 0
                      ? format(new Date(auditoriasPorLoja.auditorias[0].data || ''), "dd/MM/yyyy", { locale: ptBR })
                      : 'Nunca'
                  }
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  Total de auditorias: {auditoriasPorLoja?.auditorias?.length || 0}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Pontuação Média</h3>
              <div className="text-3xl font-bold text-primary">
                {auditoriasPorLoja?.auditorias && auditoriasPorLoja.auditorias.length > 0
                  ? (auditoriasPorLoja.auditorias.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0) / 
                     auditoriasPorLoja.auditorias.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Média baseada em todas as auditorias realizadas
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Auditorias</CardTitle>
            <CardDescription>Todas as auditorias realizadas nesta loja</CardDescription>
          </CardHeader>
          <CardContent>
            {auditoriasPorLoja?.auditorias && auditoriasPorLoja.auditorias.length > 0 ? (
              <div className="space-y-4">
                {auditoriasPorLoja.auditorias.map((auditoria) => (
                  <Card key={auditoria.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">
                              {format(new Date(auditoria.data || ''), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Auditor: {auditoria.usuario?.nome || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${
                            auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {auditoria.pontuacao_total !== null && auditoria.pontuacao_total !== undefined 
                              ? `${auditoria.pontuacao_total.toFixed(1)} pts` 
                              : '0 pts'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/relatorio/${auditoria.id}`)}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">Nenhuma auditoria realizada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ainda não foram realizadas auditorias para esta loja.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {auditoriasPorLoja?.auditorias && auditoriasPorLoja.auditorias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>Evolução da loja ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Resumo da Evolução</h3>
                  <p className="text-muted-foreground">
                    {auditoriasPorLoja.auditorias.length > 1 ? (
                      (() => {
                        const primeiraAuditoria = auditoriasPorLoja.auditorias[auditoriasPorLoja.auditorias.length - 1];
                        const ultimaAuditoria = auditoriasPorLoja.auditorias[0];
                        const diferenca = (ultimaAuditoria.pontuacao_total || 0) - (primeiraAuditoria.pontuacao_total || 0);
                        
                        if (diferenca > 0) {
                          return `A loja apresenta uma tendência de melhoria. Desde a primeira auditoria registrada, houve um aumento de ${diferenca.toFixed(1)} pontos na pontuação geral.`;
                        } else if (diferenca < 0) {
                          return `A loja apresenta uma tendência de queda no desempenho. Desde a primeira auditoria registrada, houve uma redução de ${Math.abs(diferenca).toFixed(1)} pontos na pontuação geral.`;
                        } else {
                          return "A loja mantém um desempenho estável ao longo do tempo, sem variações significativas na pontuação geral.";
                        }
                      })()
                    ) : (
                      "Apenas uma auditoria foi realizada até o momento, não sendo possível analisar tendências."
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Problemas Recorrentes</h3>
                  <p className="text-muted-foreground">
                    Baseado nas auditorias realizadas, os seguintes pontos requerem atenção constante:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                    {auditoriasPorLoja.auditorias
                      .flatMap(auditoria => 
                        auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                      )
                      .slice(0, 3)
                      .map((resposta, index) => {
                        const pergunta = perguntas?.find(p => p.id === resposta.pergunta_id);
                        return (
                          <li key={index}>{pergunta?.texto || 'Item não identificado'}</li>
                        );
                      })}
                    {auditoriasPorLoja.auditorias
                      .flatMap(auditoria => 
                        auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                      ).length === 0 && (
                      <li>Nenhum problema recorrente identificado</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Recomendação</h3>
                  <p className="text-muted-foreground">
                    {auditoriasPorLoja.auditorias
                      .flatMap(auditoria => 
                        auditoria.respostas?.filter(r => r.resposta === 'nao') || []
                      ).length > 0 ? (
                      "Implementar planos de ação específicos para corrigir os problemas recorrentes identificados e realizar monitoramento constante para garantir a efetividade das ações."
                    ) : (
                      "Manter o padrão atual de operação e buscar melhorias contínuas em todas as áreas avaliadas."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Relatorio;
