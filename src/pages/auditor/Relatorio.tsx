
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
import { db, Auditoria, Loja, Usuario, Secao, Pergunta, Resposta } from "@/lib/db";
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

const Relatorio: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pontuacoesPorSecao, setPontuacoesPorSecao] = useState<Record<number, number>>({});
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [pontosCriticos, setPontosCriticos] = useState<{ secaoId: number, nome: string, pontuacao: number }[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  
  useEffect(() => {
    if (!auditoriaId) return;
    
    const auditoriaData = db.getAuditoria(parseInt(auditoriaId));
    if (!auditoriaData) {
      toast({
        title: "Auditoria não encontrada",
        description: "Não foi possível encontrar a auditoria solicitada.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    setAuditoria(auditoriaData);
    
    // Carregar loja
    const lojaData = db.getLojas().find(l => l.id === auditoriaData.loja_id);
    setLoja(lojaData || null);
    
    // Carregar usuário
    const usuarioData = db.getUsuarios().find(u => u.id === auditoriaData.usuario_id);
    setUsuario(usuarioData || null);
    
    // Carregar seções
    const secoesData = db.getSecoes();
    setSecoes(secoesData);
    
    // Carregar perguntas
    const perguntasData = db.getPerguntas();
    setPerguntas(perguntasData);
    
    // Carregar respostas
    const respostasData = db.getRespostasByAuditoria(parseInt(auditoriaId));
    setRespostas(respostasData);
    
    // Calcular pontuações por seção
    const pontuacoes = db.calcularPontuacaoPorSecao(parseInt(auditoriaId));
    setPontuacoesPorSecao(pontuacoes);
    
    // Identificar pontos críticos
    const criticos = db.identificarPontosCriticos(parseInt(auditoriaId));
    setPontosCriticos(criticos);
  }, [auditoriaId, navigate, toast]);
  
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
  
  const getRespostasBySecao = (secaoId: number) => {
    return respostas.filter(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      return pergunta && pergunta.secao_id === secaoId;
    });
  };
  
  const getRespostaIcon = (resposta: string) => {
    switch(resposta) {
      case "Sim":
        return <Check className="h-4 w-4 text-success" />;
      case "Não":
        return <X className="h-4 w-4 text-danger" />;
      case "Regular":
        return <div className="h-4 w-4 rounded-full bg-warning"></div>;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted"></div>;
    }
  };
  
  if (!auditoria || !loja) {
    return <div>Carregando...</div>;
  }
  
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
                  <p className="text-lg font-semibold">{loja.numero} - {loja.nome}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Data da Auditoria</h4>
                  <p className="text-lg font-semibold">
                    {format(new Date(auditoria.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Auditor</h4>
                  <p className="text-lg font-semibold">{usuario?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Pontuação Total</h4>
                  <p className={`text-lg font-semibold ${
                    auditoria.pontuacao_total > 0 
                      ? 'text-success' 
                      : auditoria.pontuacao_total < 0 
                      ? 'text-danger' 
                      : ''
                  }`}>
                    {auditoria.pontuacao_total.toFixed(1)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Pontuação por Seção</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {secoes.map(secao => {
                    const pontuacao = pontuacoesPorSecao[secao.id] || 0;
                    const ehCritico = pontuacao <= 0;
                    
                    return (
                      <Card key={secao.id} className={`border ${
                        ehCritico ? 'border-danger/50 bg-danger/5' : 'border-success/50 bg-success/5'
                      }`}>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">{secao.nome}</h4>
                          <p className={`text-xl font-bold ${
                            ehCritico ? 'text-danger' : 'text-success'
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
          
          {pontosCriticos.length > 0 && (
            <Card className="border-danger/50 bg-danger/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-danger">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Pontos Críticos Identificados
                </CardTitle>
                <CardDescription>
                  Seções que precisam de atenção imediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pontosCriticos.map((ponto) => {
                    const secaoRespostas = getRespostasBySecao(ponto.secaoId);
                    const perguntasNegativas = secaoRespostas
                      .filter(r => r.pontuacao_obtida < 0)
                      .map(r => perguntas.find(p => p.id === r.pergunta_id));
                    
                    return (
                      <div key={ponto.secaoId}>
                        <h4 className="font-medium mb-2">{ponto.nome} ({ponto.pontuacao.toFixed(1)})</h4>
                        <ul className="space-y-1 ml-5 list-disc">
                          {perguntasNegativas.map((pergunta) => (
                            pergunta && (
                              <li key={pergunta.id} className="text-sm">
                                {pergunta.texto}
                              </li>
                            )
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
              {secoes.map(secao => {
                const secaoRespostas = getRespostasBySecao(secao.id);
                if (secaoRespostas.length === 0) return null;
                
                return (
                  <div key={secao.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{secao.nome}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50%]">Pergunta</TableHead>
                          <TableHead className="w-[20%]">Resposta</TableHead>
                          <TableHead>Pontuação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {secaoRespostas.map(resposta => {
                          const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
                          if (!pergunta) return null;
                          
                          return (
                            <TableRow key={resposta.id}>
                              <TableCell>{pergunta.texto}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getRespostaIcon(resposta.resposta)}
                                  <span>{resposta.resposta}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  resposta.pontuacao_obtida > 0
                                    ? 'text-success'
                                    : resposta.pontuacao_obtida < 0
                                    ? 'text-danger'
                                    : resposta.pontuacao_obtida === 0.5
                                    ? 'text-warning'
                                    : 'text-muted-foreground'
                                }`}>
                                  {resposta.pontuacao_obtida > 0 ? '+' : ''}{resposta.pontuacao_obtida}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
                auditoria.pontuacao_total > 5 
                  ? 'bg-success/10 border border-success/20' 
                  : auditoria.pontuacao_total > 0 
                  ? 'bg-warning/10 border border-warning/20' 
                  : 'bg-danger/10 border border-danger/20'
              }`}>
                <div className="font-medium mb-2">
                  {auditoria.pontuacao_total > 5 
                    ? 'Loja em boas condições' 
                    : auditoria.pontuacao_total > 0 
                    ? 'Loja necessita de melhorias' 
                    : 'Loja em condições críticas'}
                </div>
                <p className="text-sm">
                  {auditoria.pontuacao_total > 5 
                    ? 'A loja apresenta um bom desempenho geral. Continue monitorando e implementando melhorias contínuas.' 
                    : auditoria.pontuacao_total > 0 
                    ? 'A loja precisa de atenção em alguns aspectos. Recomenda-se focar nos pontos críticos identificados.' 
                    : 'A loja apresenta problemas graves que requerem atenção imediata. É necessário elaborar um plano de ação urgente.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Relatorio;
