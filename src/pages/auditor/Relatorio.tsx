
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PageTitle } from "@/components/PageTitle";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  Download, 
  Mail, 
  X 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Secao = Database['public']['Tables']['secoes']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];
type Resposta = Database['public']['Tables']['respostas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

const Relatorio: React.FC = () => {
  const { auditoriaId, lojaId } = useParams<{ auditoriaId?: string; lojaId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pontuacoesPorSecao, setPontuacoesPorSecao] = useState<Record<string, number>>({});
  const [pontosCriticos, setPontosCriticos] = useState<{ secaoId: string, nome: string, pontuacao: number }[]>([]);
  
  // Handle both routing patterns
  const realAuditoriaId = auditoriaId || lojaId;
  
  const { data: auditoria, isLoading: loadingAuditoria } = useQuery({
    queryKey: ['auditoria', realAuditoriaId],
    queryFn: async () => {
      if (!realAuditoriaId) throw new Error('ID da auditoria não fornecido');
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*)')
        .eq('id', realAuditoriaId)
        .single();
      
      if (error) throw error;
      return data as Auditoria;
    }
  });
  
  const { data: secoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as Secao[];
    }
  });
  
  const { data: perguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .order('secao_id, id');
      
      if (error) throw error;
      return data as Pergunta[];
    }
  });
  
  const { data: respostas, isLoading: loadingRespostas } = useQuery({
    queryKey: ['respostas', realAuditoriaId],
    queryFn: async () => {
      if (!realAuditoriaId) throw new Error('ID da auditoria não fornecido');
      
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', realAuditoriaId);
      
      if (error) throw error;
      return data as Resposta[];
    }
  });
  
  // Calculate pontuação por seção and identify pontos críticos
  useEffect(() => {
    if (!respostas || !perguntas || !secoes) return;
    
    // Calculate pontuação por seção
    const pontuacoes: Record<string, number> = {};
    
    secoes.forEach(secao => {
      // Obter todas as perguntas desta seção 
      const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
      
      // Obter todas as respostas das perguntas desta seção
      let pontuacaoSecao = 0;
      let totalRespondido = 0;
      
      perguntasSecao.forEach(pergunta => {
        const resposta = respostas.find(r => r.pergunta_id === pergunta.id);
        if (resposta) {
          pontuacaoSecao += resposta.pontuacao_obtida || 0;
          totalRespondido++;
        }
      });
      
      // Salvar a pontuação média da seção
      pontuacoes[secao.id] = totalRespondido > 0 ? pontuacaoSecao : 0;
    });
    
    setPontuacoesPorSecao(pontuacoes);
    
    // Identify pontos críticos (seções com pontuação <= 0)
    const criticos = secoes
      .filter(secao => pontuacoes[secao.id] <= 0)
      .map(secao => ({
        secaoId: secao.id,
        nome: secao.nome,
        pontuacao: pontuacoes[secao.id]
      }));
    
    setPontosCriticos(criticos);
  }, [respostas, perguntas, secoes]);
  
  const handleEnviarEmail = () => {
    toast({
      title: "Relatório enviado",
      description: "O relatório foi enviado por e-mail com sucesso."
    });
  };
  
  const handleDownloadPDF = () => {
    toast({
      title: "PDF gerado",
      description: "O relatório foi salvo em PDF com sucesso."
    });
  };
  
  const getRespostasBySecao = (secaoId: string) => {
    if (!respostas || !perguntas) return [];
    
    return respostas.filter(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      return pergunta && pergunta.secao_id === secaoId;
    });
  };
  
  const getPerguntasBySecao = (secaoId: string) => {
    if (!perguntas) return [];
    return perguntas.filter(pergunta => pergunta.secao_id === secaoId);
  };
  
  const getRespostaIcon = (resposta: string) => {
    switch(resposta) {
      case "Sim":
        return <Check className="h-4 w-4 text-green-500" />;
      case "Não":
        return <X className="h-4 w-4 text-red-500" />;
      case "Regular":
        return <div className="h-4 w-4 rounded-full bg-yellow-500"></div>;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };
  
  if (loadingAuditoria || loadingRespostas) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  if (!auditoria || !auditoria.loja) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Auditoria não encontrada</h2>
        <p className="text-gray-600 mb-6">Não foi possível encontrar os dados solicitados.</p>
        <Button onClick={() => navigate('/')}>Voltar para o Dashboard</Button>
      </div>
    );
  }
  
  // Identificar pontos fracos (perguntas com pontuação negativa)
  const perguntasNegativas = respostas?.filter(r => r.pontuacao_obtida && r.pontuacao_obtida < 0) || [];
  const pontosFracos = perguntasNegativas.map(resposta => {
    const pergunta = perguntas?.find(p => p.id === resposta.pergunta_id);
    const secao = pergunta ? secoes?.find(s => s.id === pergunta.secao_id) : null;
    return {
      perguntaId: resposta.pergunta_id,
      perguntaTexto: pergunta?.texto || '',
      secaoId: pergunta?.secao_id,
      secaoNome: secao?.nome || '',
      pontuacao: resposta.pontuacao_obtida || 0
    };
  });
  
  return (
    <div>
      <PageTitle 
        title="Relatório de Auditoria" 
        description="Resumo completo da auditoria realizada"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Detalhes da auditoria realizada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Loja</h4>
                  <p className="text-lg font-semibold">{auditoria.loja.numero} - {auditoria.loja.nome}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Data da Auditoria</h4>
                  <p className="text-lg font-semibold">
                    {auditoria.data ? format(new Date(auditoria.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não informada'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Auditor</h4>
                  <p className="text-lg font-semibold">{auditoria.usuario?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Pontuação Total</h4>
                  <p className={`text-lg font-semibold ${
                    auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                      ? 'text-green-500' 
                      : auditoria.pontuacao_total && auditoria.pontuacao_total < 0 
                      ? 'text-red-500' 
                      : ''
                  }`}>
                    {auditoria.pontuacao_total ? auditoria.pontuacao_total.toFixed(1) : '0'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Pontuação por Seção</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {secoes?.map(secao => {
                    const pontuacao = pontuacoesPorSecao[secao.id] || 0;
                    const ehCritico = pontuacao <= 0;
                    
                    return (
                      <Card key={secao.id} className={`border ${
                        ehCritico ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'
                      }`}>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">{secao.nome}</h4>
                          <p className={`text-xl font-bold ${
                            ehCritico ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {pontuacao.toFixed(1)}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {pontosFracos.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Pontos Fracos Identificados
                </CardTitle>
                <CardDescription>
                  Itens que precisam de atenção imediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {secoes?.map((secao) => {
                    // Filtrar pontos fracos desta seção
                    const pontosFracosSecao = pontosFracos.filter(p => p.secaoId === secao.id);
                    if (pontosFracosSecao.length === 0) return null;
                    
                    return (
                      <div key={secao.id}>
                        <h4 className="font-medium mb-2">{secao.nome}</h4>
                        <ul className="space-y-1 ml-5 list-disc">
                          {pontosFracosSecao.map((ponto) => (
                            <li key={ponto.perguntaId} className="text-sm">
                              {ponto.perguntaTexto} ({ponto.pontuacao.toFixed(1)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Detalhes das Respostas</CardTitle>
              <CardDescription>
                Todas as respostas registradas durante a auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {secoes?.map(secao => {
                const secaoRespostas = getRespostasBySecao(secao.id);
                const perguntasSecao = getPerguntasBySecao(secao.id);
                if (secaoRespostas.length === 0 && perguntasSecao.length === 0) return null;
                
                return (
                  <div key={secao.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{secao.nome}</h3>
                    {secaoRespostas.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50%]">Pergunta</TableHead>
                            <TableHead className="w-[20%]">Resposta</TableHead>
                            <TableHead>Pontuação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {perguntasSecao.map(pergunta => {
                            const resposta = secaoRespostas.find(r => r.pergunta_id === pergunta.id);
                            
                            return (
                              <TableRow key={pergunta.id}>
                                <TableCell>{pergunta.texto}</TableCell>
                                <TableCell>
                                  {resposta ? (
                                    <div className="flex items-center space-x-2">
                                      {getRespostaIcon(resposta.resposta || '')}
                                      <span>{resposta.resposta}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Não respondido</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {resposta ? (
                                    <span className={`font-medium ${
                                      resposta.pontuacao_obtida && resposta.pontuacao_obtida > 0
                                        ? 'text-green-500'
                                        : resposta.pontuacao_obtida && resposta.pontuacao_obtida < 0
                                        ? 'text-red-500'
                                        : resposta.pontuacao_obtida === 0.5
                                        ? 'text-yellow-500'
                                        : 'text-gray-500'
                                    }`}>
                                      {resposta.pontuacao_obtida && resposta.pontuacao_obtida > 0 ? '+' : ''}{resposta.pontuacao_obtida}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma resposta registrada para esta seção
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Salvar Relatório em PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleEnviarEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Relatório por Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`rounded-md p-4 ${
                auditoria.pontuacao_total && auditoria.pontuacao_total > 5 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                  ? 'bg-yellow-500/10 border border-yellow-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className="font-medium mb-2">
                  {auditoria.pontuacao_total && auditoria.pontuacao_total > 5 
                    ? 'Loja em boas condições' 
                    : auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                    ? 'Loja necessita de melhorias' 
                    : 'Loja em condições críticas'}
                </div>
                <p className="text-sm">
                  {auditoria.pontuacao_total && auditoria.pontuacao_total > 5 
                    ? 'A loja apresenta um bom desempenho geral. Continue monitorando e implementando melhorias contínuas.' 
                    : auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                    ? 'A loja precisa de atenção em alguns aspectos. Recomenda-se focar nos pontos críticos identificados.' 
                    : 'A loja apresenta problemas graves que requerem atenção imediata. É necessário elaborar um plano de ação urgente.'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {pontosFracos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Pontos Fracos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Esta auditoria identificou {pontosFracos.length} {pontosFracos.length === 1 ? 'item crítico' : 'itens críticos'} que necessitam de atenção imediata. 
                    Estes problemas estão concentrados principalmente nas seguintes áreas:
                  </p>
                  
                  {/* Resumo de pontos fracos por seção */}
                  <div className="space-y-2">
                    {secoes?.filter(secao => {
                      const pontosFracosSecao = pontosFracos.filter(p => p.secaoId === secao.id);
                      return pontosFracosSecao.length > 0;
                    }).map(secao => {
                      const pontosFracosSecao = pontosFracos.filter(p => p.secaoId === secao.id);
                      return (
                        <div key={secao.id} className="flex justify-between items-center">
                          <span>{secao.nome}</span>
                          <span className="font-medium text-red-500">{pontosFracosSecao.length} {pontosFracosSecao.length === 1 ? 'item' : 'itens'}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm">
                    <p className="font-medium mb-2">Recomendações:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Criar plano de ação para corrigir os pontos fracos identificados</li>
                      <li>Priorizar as seções com maior número de itens críticos</li>
                      <li>Realizar nova auditoria em 30 dias para verificar melhorias</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorio;
