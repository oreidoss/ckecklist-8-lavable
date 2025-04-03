
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/PageTitle";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, FileText, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

const AdminRelatorios: React.FC = () => {
  const [lojaFiltro, setLojaFiltro] = useState<string>('');
  const [dadosGrafico, setDadosGrafico] = useState<{ nome: string; pontuacao: number }[]>([]);
  const navigate = useNavigate();
  
  const { data: auditorias, isLoading: isLoadingAuditorias } = useQuery({
    queryKey: ['auditorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*)')
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as Auditoria[];
    }
  });
  
  const { data: lojas } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .order('numero');
      
      if (error) throw error;
      return data as Loja[];
    }
  });
  
  // Preparar dados para o gráfico
  useEffect(() => {
    if (!auditorias || !lojas) return;
    
    const dadosParaGrafico = lojas.map(loja => {
      const auditoriasLoja = auditorias.filter(a => a.loja_id === loja.id);
      const mediaPontuacao = auditoriasLoja.length > 0
        ? auditoriasLoja.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0) / auditoriasLoja.length
        : 0;
      
      return {
        nome: loja.nome,
        pontuacao: parseFloat(mediaPontuacao.toFixed(1))
      };
    }).sort((a, b) => b.pontuacao - a.pontuacao); // Sort by score descending
    
    setDadosGrafico(dadosParaGrafico);
  }, [auditorias, lojas]);
  
  // Filtra auditorias por loja selecionada
  const auditoriasFiltradas = lojaFiltro && auditorias
    ? auditorias.filter(auditoria => auditoria.loja_id === lojaFiltro)
    : auditorias;
  
  const getStatusAuditoria = (pontuacao: number | null) => {
    if (!pontuacao) return <Badge className="bg-gray-500 hover:bg-gray-500">Pendente</Badge>;
    
    if (pontuacao > 5) {
      return <Badge className="bg-green-500 hover:bg-green-500">Aprovada</Badge>;
    } else if (pontuacao > 0) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-500">Melhorias Necessárias</Badge>;
    } else {
      return <Badge className="bg-red-500 hover:bg-red-500">Crítica</Badge>;
    }
  };
  
  // Função para calcular estatísticas globais
  const calcularEstatisticas = () => {
    if (!auditorias) return { total: 0, lojasAuditadas: 0, aprovadas: 0, melhorias: 0, criticas: 0, media: 0 };
    
    const lojasAuditadas = new Set(auditorias.map(a => a.loja_id)).size;
    const aprovadas = auditorias.filter(a => a.pontuacao_total && a.pontuacao_total > 5).length;
    const melhorias = auditorias.filter(a => a.pontuacao_total && a.pontuacao_total > 0 && a.pontuacao_total <= 5).length;
    const criticas = auditorias.filter(a => !a.pontuacao_total || a.pontuacao_total <= 0).length;
    
    let mediaPontuacao = 0;
    if (auditorias.length > 0) {
      const somaPontuacoes = auditorias.reduce((acc, curr) => acc + (curr.pontuacao_total || 0), 0);
      mediaPontuacao = somaPontuacoes / auditorias.length;
    }
    
    return {
      total: auditorias.length,
      lojasAuditadas,
      aprovadas,
      melhorias,
      criticas,
      media: parseFloat(mediaPontuacao.toFixed(1))
    };
  };
  
  const estatisticas = calcularEstatisticas();
  
  return (
    <div>
      <PageTitle 
        title="Relatórios de Auditorias" 
        description="Visualize e analise os resultados das auditorias realizadas"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho das Lojas</CardTitle>
              <CardDescription>
                Pontuação média das auditorias por loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dadosGrafico.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis domain={[-5, 10]} />
                      <Tooltip formatter={(value) => [`${value} pontos`, 'Pontuação']} />
                      <Bar 
                        dataKey="pontuacao" 
                        fill="hsl(var(--primary))" 
                        name="Pontuação"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Nenhum dado disponível para exibição</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Histórico de Auditorias</CardTitle>
                <CardDescription>
                  Lista de todas as auditorias realizadas
                </CardDescription>
              </div>
              {lojas && lojas.length > 0 && (
                <Select 
                  value={lojaFiltro} 
                  onValueChange={setLojaFiltro}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas as lojas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as lojas</SelectItem>
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.numero} - {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingAuditorias ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando auditorias...</p>
                </div>
              ) : auditoriasFiltradas && auditoriasFiltradas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditoriasFiltradas.map((auditoria) => (
                      <TableRow key={auditoria.id}>
                        <TableCell>
                          {auditoria.data ? format(new Date(auditoria.data), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                        </TableCell>
                        <TableCell>{auditoria.loja ? `${auditoria.loja.numero} - ${auditoria.loja.nome}` : 'N/A'}</TableCell>
                        <TableCell>{auditoria.usuario?.nome || 'N/A'}</TableCell>
                        <TableCell className={`font-medium ${
                          auditoria.pontuacao_total && auditoria.pontuacao_total > 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {auditoria.pontuacao_total ? auditoria.pontuacao_total.toFixed(1) : '0.0'}
                        </TableCell>
                        <TableCell>
                          {getStatusAuditoria(auditoria.pontuacao_total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/relatorio/${auditoria.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhuma auditoria encontrada</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lojaFiltro 
                      ? "Não há auditorias para a loja selecionada." 
                      : "Não há auditorias realizadas no sistema."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
              <CardDescription>
                Estatísticas gerais das auditorias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground">Total de Auditorias</span>
                    <span className="text-3xl font-bold">{estatisticas.total}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground">Lojas Auditadas</span>
                    <span className="text-3xl font-bold">{estatisticas.lojasAuditadas}</span>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Distribuição de Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Aprovadas</span>
                    <span className="text-sm font-medium">{estatisticas.aprovadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Melhorias Necessárias</span>
                    <span className="text-sm font-medium">{estatisticas.melhorias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Críticas</span>
                    <span className="text-sm font-medium">{estatisticas.criticas}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Pontuação Média Geral</h3>
                <div className="flex items-center">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ 
                        width: `${
                          estatisticas.total > 0 
                            ? Math.min(
                                Math.max(
                                  (estatisticas.media + 10) * 5, 
                                  0
                                ), 
                                100
                              ) 
                            : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 font-bold text-primary">
                    {estatisticas.media}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Problemas Mais Frequentes</CardTitle>
              <CardDescription>
                Análise de pontos críticos nas auditorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditorias && auditorias.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <p>Com base nas {auditorias.length} auditorias realizadas, identificamos os seguintes padrões de problemas:</p>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <h4 className="font-medium">Áreas que precisam de atenção:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">
                          {estatisticas.criticas > 0 
                            ? `${estatisticas.criticas} ${estatisticas.criticas === 1 ? 'loja precisa' : 'lojas precisam'} de intervenção urgente`
                            : 'Nenhuma loja em situação crítica'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">
                          {estatisticas.melhorias} {estatisticas.melhorias === 1 ? 'loja requer' : 'lojas requerem'} melhorias pontuais
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    <p className="font-medium mb-1">Recomendação:</p>
                    <p>
                      {estatisticas.criticas > 0 
                        ? 'Focar em treinamentos e intervenções nas lojas identificadas em situação crítica.'
                        : estatisticas.melhorias > estatisticas.aprovadas
                        ? 'Implementar melhorias de padronização nas lojas que necessitam de ajustes.'
                        : 'Manter o padrão de qualidade e identificar melhores práticas para replicar nas demais lojas.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Realize mais auditorias para gerar análises de pontos críticos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorios;
