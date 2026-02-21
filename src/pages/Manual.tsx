
import React from 'react';
import {
  BookOpen, Store, Layers, HelpCircle, Users, BarChart, 
  ClipboardCheck, FileText, LogIn, Shield, CheckCircle2, 
  XCircle, AlertTriangle, Minus, MessageSquare, Paperclip,
  ChevronRight, ArrowLeft, Save, Send, PenTool, Download,
  Eye, Plus, Pencil, Trash2, Settings, Home, Search,
  Star, TrendingUp, Calendar, UserCheck, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="bg-primary/10 p-2.5 rounded-lg">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
  </div>
);

const StepItem = ({ number, title, description, icon: Icon }: { number: number; title: string; description: string; icon?: React.ElementType }) => (
  <div className="flex gap-3 items-start py-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex gap-3 items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
    <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
    <div>
      <span className="font-medium text-foreground text-sm">{title}</span>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

const ResponseBadge = ({ type, label, color }: { type: string; label: string; color: string }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${color}`}>
    {type === 'sim' && <CheckCircle2 className="h-4 w-4" />}
    {type === 'nao' && <XCircle className="h-4 w-4" />}
    {type === 'regular' && <AlertTriangle className="h-4 w-4" />}
    {type === 'na' && <Minus className="h-4 w-4" />}
    {label}
  </div>
);

const ManualPage: React.FC = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manual do Sistema</h1>
          <p className="text-muted-foreground text-lg">Checklist 9.0 - Guia Completo de Utilização</p>
          <Badge variant="outline" className="mt-2">Versão 9.0</Badge>
        </div>

        <Separator />

        {/* Índice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Índice do Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: LogIn, label: '1. Login e Acesso' },
                { icon: Home, label: '2. Tela Inicial (Auditor)' },
                { icon: ClipboardCheck, label: '3. Realizando uma Auditoria' },
                { icon: FileText, label: '4. Relatórios' },
                { icon: Store, label: '5. Gestão de Lojas (Admin)' },
                { icon: Layers, label: '6. Gestão de Seções (Admin)' },
                { icon: HelpCircle, label: '7. Gestão de Perguntas (Admin)' },
                { icon: Users, label: '8. Gestão de Usuários (Admin)' },
                { icon: BarChart, label: '9. Relatórios Gerais (Admin)' },
                { icon: PenTool, label: '10. Assinatura Digital' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 text-sm">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 1. Login e Acesso */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={LogIn} title="1. Login e Acesso ao Sistema" />
            <p className="text-sm text-muted-foreground mb-4">
              O Checklist 9.0 possui um sistema de autenticação seguro. Apenas usuários cadastrados podem acessar o sistema.
            </p>
            
            <div className="space-y-1">
              <StepItem 
                number={1} 
                icon={Eye}
                title="Acesse a tela de login" 
                description="Ao abrir o sistema, você será redirecionado automaticamente para a tela de login caso não esteja autenticado." 
              />
              <StepItem 
                number={2} 
                icon={Lock}
                title="Insira suas credenciais" 
                description="Digite seu e-mail e senha nos campos correspondentes. As credenciais são fornecidas pelo administrador do sistema." 
              />
              <StepItem 
                number={3} 
                icon={ChevronRight}
                title="Clique em 'Entrar'" 
                description="Após inserir suas credenciais, clique no botão 'Entrar' para acessar o sistema." 
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Perfis de Acesso</span>
              </div>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 ml-6">
                <li>• <strong>Auditor:</strong> Acesso à área de auditorias e checklists</li>
                <li>• <strong>Administrador:</strong> Acesso completo, incluindo gestão de lojas, seções, perguntas, usuários e relatórios</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tela Inicial */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={Home} title="2. Tela Inicial do Auditor" />
            <p className="text-sm text-muted-foreground mb-4">
              A tela inicial exibe todas as lojas disponíveis para auditoria, com informações sobre o status de cada uma.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureItem 
                icon={Store} 
                title="Cards de Lojas" 
                description="Cada loja aparece como um card com nome, número e última pontuação obtida." 
              />
              <FeatureItem 
                icon={Star} 
                title="Pontuação" 
                description="A pontuação da última auditoria é exibida com indicador visual de cores." 
              />
              <FeatureItem 
                icon={Calendar} 
                title="Data da Auditoria" 
                description="Exibe a data da última auditoria realizada na loja." 
              />
              <FeatureItem 
                icon={Plus} 
                title="Nova Auditoria" 
                description="Botão para iniciar uma nova auditoria na loja selecionada." 
              />
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Auditoria em Andamento</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-300 ml-6">
                Se houver uma auditoria em andamento, o card da loja exibirá um badge "Em Andamento" e o botão mudará para "Continuar", permitindo retomar de onde parou.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Realizando Auditoria */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={ClipboardCheck} title="3. Realizando uma Auditoria" />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="iniciar">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    3.1 Iniciar Nova Auditoria
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pl-2">
                    <StepItem number={1} icon={Store} title="Selecione a loja" description="Na tela inicial, clique em 'Novo Checklist' ou 'Avaliar' no card da loja desejada." />
                    <StepItem number={2} icon={UserCheck} title="Selecione Supervisor e Gerente" description="No diálogo que aparecer, selecione o supervisor e o gerente responsáveis pela auditoria." />
                    <StepItem number={3} icon={ChevronRight} title="Inicie a auditoria" description="Clique em 'Iniciar Auditoria' para começar o checklist." />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="navegacao">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    3.2 Navegação por Seções
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    O checklist é organizado em seções. Cada seção contém um conjunto de perguntas relacionadas.
                  </p>
                  <div className="space-y-2">
                    <FeatureItem icon={Layers} title="Barra de Seções" description="No topo do checklist, uma barra de navegação mostra todas as seções. Clique em qualquer seção para navegar diretamente." />
                    <FeatureItem icon={ChevronRight} title="Botões Anterior/Próximo" description="Use os botões na parte inferior para navegar sequencialmente entre as seções." />
                    <FeatureItem icon={CheckCircle2} title="Indicador de Progresso" description="Cada seção mostra a porcentagem de conclusão e um indicador visual (verde = completa, amarelo = parcial)." />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="respostas">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    3.3 Respondendo as Perguntas
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cada pergunta possui 4 opções de resposta:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <ResponseBadge type="sim" label="Sim (Conforme)" color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
                    <ResponseBadge type="nao" label="Não (Não Conforme)" color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
                    <ResponseBadge type="regular" label="Regular" color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />
                    <ResponseBadge type="na" label="N/A (Não Aplicável)" color="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <FeatureItem icon={MessageSquare} title="Observação" description="Para cada pergunta, você pode adicionar uma observação descrevendo detalhes ou justificativas." />
                    <FeatureItem icon={Paperclip} title="Anexo" description="É possível anexar uma foto ou documento como evidência para cada pergunta." />
                  </div>

                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Save className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">Salvamento Automático</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-300 ml-6">
                      As respostas são salvas automaticamente ao navegar entre seções. Você também pode clicar em "Salvar" a qualquer momento.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="finalizar">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-primary" />
                    3.4 Finalizando a Auditoria
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pl-2">
                    <StepItem number={1} icon={CheckCircle2} title="Complete todas as seções" description="Certifique-se de que todas as perguntas de todas as seções foram respondidas (100% de progresso)." />
                    <StepItem number={2} icon={Save} title="Clique em 'Assinar e Finalizar'" description="Quando o checklist estiver 100% completo, o botão 'Salvar e Voltar' mudará para 'Assinar e Finalizar'." />
                    <StepItem number={3} icon={PenTool} title="Assine digitalmente" description="Um diálogo de assinatura será exibido. O supervisor e o gerente devem assinar usando o dedo ou mouse na área designada." />
                    <StepItem number={4} icon={CheckCircle2} title="Confirme a finalização" description="Após ambas as assinaturas, clique em 'Finalizar Auditoria'. O status será alterado para 'Concluído'." />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* 4. Relatórios */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={FileText} title="4. Relatórios de Auditoria" />
            <p className="text-sm text-muted-foreground mb-4">
              Após finalizar uma auditoria, é possível visualizar e exportar relatórios detalhados.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureItem icon={Eye} title="Visualizar Relatório" description="Clique no botão 'Relatório' no checklist para ver o relatório completo da auditoria." />
              <FeatureItem icon={Download} title="Exportar PDF" description="Exporte o relatório em formato PDF para impressão ou compartilhamento." />
              <FeatureItem icon={Send} title="Enviar por E-mail" description="Envie o relatório diretamente por e-mail para os responsáveis." />
              <FeatureItem icon={TrendingUp} title="Análise de Tendências" description="Visualize gráficos de evolução da pontuação ao longo do tempo." />
              <FeatureItem icon={BarChart} title="Pontuação por Seção" description="Veja a pontuação detalhada de cada seção da auditoria." />
              <FeatureItem icon={AlertTriangle} title="Pontos de Atenção" description="Identifique rapidamente os itens que precisam de correção." />
            </div>
          </CardContent>
        </Card>

        {/* Seções Admin */}
        <div className="text-center py-4">
          <Badge variant="default" className="text-sm px-4 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Área Administrativa
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            As funcionalidades abaixo são exclusivas para administradores
          </p>
        </div>

        {/* 5. Gestão de Lojas */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={Store} title="5. Gestão de Lojas" />
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie todas as lojas que serão auditadas no sistema.
            </p>
            
            <div className="space-y-2">
              <FeatureItem icon={Plus} title="Adicionar Loja" description="Clique em 'Nova Loja' para cadastrar uma nova loja. Informe o número e o nome da loja." />
              <FeatureItem icon={Pencil} title="Editar Loja" description="Clique no ícone de edição para alterar o nome ou número de uma loja existente." />
              <FeatureItem icon={Trash2} title="Excluir Loja" description="Clique no ícone de lixeira para excluir uma loja. Atenção: lojas com auditorias não podem ser excluídas." />
              <FeatureItem icon={Eye} title="Visualizar Detalhes" description="Veja informações detalhadas da loja, incluindo número de auditorias e última pontuação." />
            </div>
          </CardContent>
        </Card>

        {/* 6. Gestão de Seções */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={Layers} title="6. Gestão de Seções" />
            <p className="text-sm text-muted-foreground mb-4">
              As seções organizam as perguntas do checklist em categorias temáticas.
            </p>
            
            <div className="space-y-2">
              <FeatureItem icon={Plus} title="Adicionar Seção" description="Clique em 'Nova Seção' para criar uma nova categoria de perguntas." />
              <FeatureItem icon={Pencil} title="Editar Seção" description="Altere o nome de uma seção existente clicando no ícone de edição." />
              <FeatureItem icon={Trash2} title="Excluir Seção" description="Remova uma seção. Atenção: seções com perguntas vinculadas não podem ser excluídas." />
              <FeatureItem icon={Eye} title="Ver Perguntas" description="Clique no ícone de visualização para ver todas as perguntas vinculadas à seção." />
            </div>
          </CardContent>
        </Card>

        {/* 7. Gestão de Perguntas */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={HelpCircle} title="7. Gestão de Perguntas" />
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre e gerencie as perguntas que compõem o checklist de auditoria.
            </p>
            
            <div className="space-y-2">
              <FeatureItem icon={Plus} title="Adicionar Pergunta" description="Clique em 'Nova Pergunta', selecione a seção e digite o texto da pergunta." />
              <FeatureItem icon={Pencil} title="Editar Pergunta" description="Altere o texto ou a seção de uma pergunta existente." />
              <FeatureItem icon={Trash2} title="Excluir Pergunta" description="Remova uma pergunta do checklist. Perguntas com respostas registradas podem ser excluídas." />
              <FeatureItem icon={Search} title="Filtrar por Seção" description="Use o filtro de seções para visualizar apenas as perguntas de uma seção específica." />
              <FeatureItem icon={Download} title="Exportar Excel" description="Exporte todas as perguntas e seções em formato Excel para backup ou análise." />
            </div>
          </CardContent>
        </Card>

        {/* 8. Gestão de Usuários */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={Users} title="8. Gestão de Usuários" />
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie os usuários do sistema, incluindo auditores, supervisores e gerentes.
            </p>
            
            <div className="space-y-2">
              <FeatureItem icon={Plus} title="Adicionar Usuário" description="Cadastre um novo usuário informando nome, e-mail, senha e função (Auditor, Supervisor, Gerente ou Admin)." />
              <FeatureItem icon={Pencil} title="Editar Usuário" description="Altere nome, e-mail, função ou senha de um usuário existente." />
              <FeatureItem icon={Trash2} title="Excluir Usuário" description="Remova um usuário do sistema." />
            </div>

            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">Funções do Sistema</span>
              </div>
              <ul className="text-xs text-purple-600 dark:text-purple-300 space-y-1 ml-6">
                <li>• <strong>Auditor:</strong> Realiza auditorias e preenche checklists</li>
                <li>• <strong>Supervisor:</strong> Supervisiona auditorias e assina checklists</li>
                <li>• <strong>Gerente:</strong> Gerencia a loja e assina checklists</li>
                <li>• <strong>Admin:</strong> Acesso completo ao sistema, incluindo configurações</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 9. Relatórios Admin */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={BarChart} title="9. Relatórios Gerais (Admin)" />
            <p className="text-sm text-muted-foreground mb-4">
              Visão geral de todas as auditorias realizadas no sistema.
            </p>
            
            <div className="space-y-2">
              <FeatureItem icon={BarChart} title="Resumo Geral" description="Visualize estatísticas gerais como total de auditorias, média de pontuação e taxa de conformidade." />
              <FeatureItem icon={TrendingUp} title="Desempenho por Loja" description="Compare o desempenho entre lojas com gráficos interativos." />
              <FeatureItem icon={Calendar} title="Histórico de Auditorias" description="Veja a lista completa de auditorias com filtros por data, loja e status." />
              <FeatureItem icon={Eye} title="Detalhes da Auditoria" description="Clique em uma auditoria para ver o relatório completo com todas as respostas." />
              <FeatureItem icon={Trash2} title="Excluir Auditoria" description="Remova auditorias incorretas ou de teste do sistema." />
            </div>
          </CardContent>
        </Card>

        {/* 10. Assinatura Digital */}
        <Card>
          <CardContent className="pt-6">
            <SectionTitle icon={PenTool} title="10. Assinatura Digital" />
            <p className="text-sm text-muted-foreground mb-4">
              O sistema suporta assinatura digital para finalização de auditorias.
            </p>
            
            <div className="space-y-1 mb-4">
              <StepItem number={1} icon={CheckCircle2} title="Complete o checklist" description="Responda 100% das perguntas de todas as seções." />
              <StepItem number={2} icon={Save} title="Clique em 'Assinar e Finalizar'" description="O botão aparece automaticamente quando o checklist está completo." />
              <StepItem number={3} icon={PenTool} title="Assinatura do Supervisor" description="O supervisor deve assinar na área designada usando o dedo (touch) ou o mouse." />
              <StepItem number={4} icon={PenTool} title="Assinatura do Gerente" description="O gerente deve assinar na área designada abaixo da assinatura do supervisor." />
              <StepItem number={5} icon={CheckCircle2} title="Finalizar" description="Clique em 'Finalizar Auditoria' para concluir. O status será alterado para 'Concluído'." />
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Dica</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 ml-6">
                Caso cometa um erro na assinatura, use o botão "Limpar" para apagar e refazer. As assinaturas são armazenadas de forma segura no sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} O REI DOS CATÁLOGOS - Rogerio Carvalheira</p>
          <p className="mt-1">Checklist 9.0 - Todos os direitos reservados</p>
        </div>
      </div>
    </>
  );
};

export default ManualPage;
