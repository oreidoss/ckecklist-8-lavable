
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageTitle } from "@/components/PageTitle";
import { db, Secao, Pergunta, Resposta, pontuacaoMap } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ClipboardCheck, Save } from 'lucide-react';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<number, Resposta>>({});
  const [progresso, setProgresso] = useState<number>(0);
  const [pontuacaoTotal, setPontuacaoTotal] = useState<number>(0);
  
  useEffect(() => {
    // Carregar dados
    if (!auditoriaId) return;
    
    const auditoria = db.getAuditoria(parseInt(auditoriaId));
    if (!auditoria) {
      toast({
        title: "Auditoria não encontrada",
        description: "Não foi possível encontrar a auditoria solicitada.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    const todasSecoes = db.getSecoes();
    const todasPerguntas = db.getPerguntas();
    
    // Filtrar apenas seções que tenham perguntas
    const secoesComPerguntas = todasSecoes.filter(secao => 
      todasPerguntas.some(pergunta => pergunta.secao_id === secao.id)
    );
    
    setSecoes(secoesComPerguntas);
    setPerguntas(todasPerguntas);
    
    // Carregar respostas existentes, se houver
    const respostasExistentes = db.getRespostasByAuditoria(parseInt(auditoriaId));
    const respostasMap: Record<number, Resposta> = {};
    
    respostasExistentes.forEach(resposta => {
      respostasMap[resposta.pergunta_id] = resposta;
    });
    
    setRespostas(respostasMap);
    
    // Calcular progresso
    const totalPerguntas = todasPerguntas.length;
    const respondidas = respostasExistentes.length;
    setProgresso(totalPerguntas > 0 ? (respondidas / totalPerguntas) * 100 : 0);
    
    // Atualizar pontuação total
    setPontuacaoTotal(db.calcularPontuacaoTotal(parseInt(auditoriaId)));
  }, [auditoriaId, navigate, toast]);
  
  const handleResposta = (perguntaId: number, valor: "Sim" | "Não" | "Regular" | "Não se aplica") => {
    if (!auditoriaId) return;
    
    const pontuacao = pontuacaoMap[valor];
    
    let resposta: Resposta;
    
    // Verifica se já existe uma resposta para essa pergunta
    if (respostas[perguntaId]) {
      resposta = {
        ...respostas[perguntaId],
        resposta: valor,
        pontuacao_obtida: pontuacao
      };
      db.updateResposta(resposta);
    } else {
      resposta = db.addResposta({
        auditoria_id: parseInt(auditoriaId),
        pergunta_id: perguntaId,
        resposta: valor,
        pontuacao_obtida: pontuacao
      });
    }
    
    // Atualiza o estado local
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: resposta
    }));
    
    // Recalcular progresso
    const totalPerguntas = perguntas.length;
    const respondidas = Object.keys({ ...respostas, [perguntaId]: resposta }).length;
    setProgresso(totalPerguntas > 0 ? (respondidas / totalPerguntas) * 100 : 0);
    
    // Atualizar pontuação total
    const novaPontuacao = db.calcularPontuacaoTotal(parseInt(auditoriaId));
    setPontuacaoTotal(novaPontuacao);
    
    // Atualiza a auditoria com a nova pontuação
    const auditoria = db.getAuditoria(parseInt(auditoriaId));
    if (auditoria) {
      db.updateAuditoria({
        ...auditoria,
        pontuacao_total: novaPontuacao
      });
    }
  };
  
  const handleFinalizarAuditoria = () => {
    if (!auditoriaId) return;
    
    const totalPerguntas = perguntas.length;
    const respondidas = Object.keys(respostas).length;
    
    if (respondidas < totalPerguntas) {
      toast({
        title: "Checklist incompleto",
        description: `Você respondeu ${respondidas} de ${totalPerguntas} perguntas. Deseja finalizar mesmo assim?`,
        action: (
          <Button variant="default" onClick={() => navigate(`/relatorio/${auditoriaId}`)}>
            Finalizar
          </Button>
        )
      });
      return;
    }
    
    navigate(`/relatorio/${auditoriaId}`);
  };
  
  const getPerguntasBySecao = (secaoId: number) => {
    return perguntas.filter(pergunta => pergunta.secao_id === secaoId);
  };
  
  return (
    <div>
      <PageTitle 
        title="Checklist de Auditoria" 
        description="Responda todas as perguntas para completar a auditoria"
      />
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Progresso da Auditoria</div>
          <div className="text-sm font-medium">{Math.round(progresso)}%</div>
        </div>
        <Progress value={progresso} className="h-2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {secoes.map((secao) => {
            const secaoPerguntas = getPerguntasBySecao(secao.id);
            if (secaoPerguntas.length === 0) return null;
            
            return (
              <Accordion 
                key={secao.id} 
                type="single" 
                collapsible 
                defaultValue={secao.id.toString()}
                className="border rounded-lg"
              >
                <AccordionItem value={secao.id.toString()} className="border-none">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center">
                      <span>{secao.nome}</span>
                      <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {secaoPerguntas.filter(p => respostas[p.id]).length}/{secaoPerguntas.length}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-6">
                      {secaoPerguntas.map((pergunta) => (
                        <Card key={pergunta.id} className={respostas[pergunta.id] ? 'border-primary/20 bg-primary/5' : ''}>
                          <CardContent className="pt-6">
                            <div className="mb-3">{pergunta.texto}</div>
                            <RadioGroup 
                              value={respostas[pergunta.id]?.resposta} 
                              onValueChange={(value) => handleResposta(
                                pergunta.id, 
                                value as "Sim" | "Não" | "Regular" | "Não se aplica"
                              )}
                              className="grid grid-cols-2 gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="Sim" 
                                  id={`${pergunta.id}-sim`} 
                                  className="border-success text-success" 
                                />
                                <Label 
                                  htmlFor={`${pergunta.id}-sim`}
                                  className="cursor-pointer text-success font-medium"
                                >
                                  Sim (+1)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="Não" 
                                  id={`${pergunta.id}-nao`} 
                                  className="border-danger text-danger" 
                                />
                                <Label 
                                  htmlFor={`${pergunta.id}-nao`}
                                  className="cursor-pointer text-danger font-medium"
                                >
                                  Não (-1)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="Regular" 
                                  id={`${pergunta.id}-regular`} 
                                  className="border-warning text-warning" 
                                />
                                <Label 
                                  htmlFor={`${pergunta.id}-regular`}
                                  className="cursor-pointer text-warning font-medium"
                                >
                                  Regular (+0,5)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="Não se aplica" 
                                  id={`${pergunta.id}-na`} 
                                  className="border-muted-foreground text-muted-foreground" 
                                />
                                <Label 
                                  htmlFor={`${pergunta.id}-na`}
                                  className="cursor-pointer text-muted-foreground font-medium"
                                >
                                  Não se aplica (0)
                                </Label>
                              </div>
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Resumo da Auditoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Pontuação Total
                </div>
                <div className={`text-3xl font-bold ${
                  pontuacaoTotal > 0 ? 'text-success' : pontuacaoTotal < 0 ? 'text-danger' : 'text-muted-foreground'
                }`}>
                  {pontuacaoTotal.toFixed(1)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Perguntas Respondidas
                </div>
                <div className="flex items-center">
                  <div className="text-lg font-semibold">
                    {Object.keys(respostas).length} de {perguntas.length}
                  </div>
                  <div className="text-xs ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {Math.round(progresso)}%
                  </div>
                </div>
              </div>
              
              {progresso < 100 && (
                <div className="bg-warning/10 border border-warning/20 text-warning rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    Ainda há perguntas pendentes. Complete todas as perguntas para uma auditoria mais precisa.
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button 
                className="w-full" 
                onClick={handleFinalizarAuditoria}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Finalizar Auditoria
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => toast({
                  title: "Auditoria salva",
                  description: "Suas respostas foram salvas automaticamente."
                })}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar e Continuar Depois
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
