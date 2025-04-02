
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
import { db, Auditoria, Loja, Usuario } from "@/lib/db";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, FileText, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminRelatorios: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState<string>('');
  const [dadosGrafico, setDadosGrafico] = useState<{ nome: string; pontuacao: number }[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Carregar dados do banco de dados
    const todasAuditorias = db.getAuditorias();
    const todasLojas = db.getLojas();
    const todosUsuarios = db.getUsuarios();
    
    setAuditorias(todasAuditorias);
    setLojas(todasLojas);
    setUsuarios(todosUsuarios);
    
    // Preparar dados para o gráfico
    const dadosParaGrafico = todasLojas.map(loja => {
      const auditoriasLoja = todasAuditorias.filter(a => a.loja_id === loja.id);
      const mediaPontuacao = auditoriasLoja.length > 0
        ? auditoriasLoja.reduce((acc, curr) => acc + curr.pontuacao_total, 0) / auditoriasLoja.length
        : 0;
      
      return {
        nome: loja.nome,
        pontuacao: parseFloat(mediaPontuacao.toFixed(1))
      };
    });
    
    setDadosGrafico(dadosParaGrafico);
  }, []);
  
  // Filtra auditorias por loja selecionada
  const auditoriasFiltradas = lojaFiltro
    ? auditorias.filter(auditoria => auditoria.loja_id === parseInt(lojaFiltro))
    : auditorias;
  
  // Ordena por data, mais recentes primeiro
  const auditoriasOrdenadas = [...auditoriasFiltradas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
  const getNomeLoja = (lojaId: number) => {
    const loja = lojas.find(l => l.id === lojaId);
    return loja ? `${loja.numero} - ${loja.nome}` : 'Loja não encontrada';
  };
  
  const getNomeUsuario = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nome : 'Usuário não encontrado';
  };
  
  const getStatusAuditoria = (pontuacao: number) => {
    if (pontuacao > 5) {
      return <Badge className="bg-success hover:bg-success">Aprovada</Badge>;
    } else if (pontuacao > 0) {
      return <Badge className="bg-warning hover:bg-warning">Melhorias Necessárias</Badge>;
    } else {
      return <Badge className="bg-danger hover:bg-danger">Crítica</Badge>;
    }
  };
  
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
                      <YAxis />
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
                    <SelectItem key={loja.id} value={loja.id.toString()}>
                      {loja.numero} - {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {auditoriasOrdenadas.length > 0 ? (
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
                    {auditoriasOrdenadas.map((auditoria) => (
                      <TableRow key={auditoria.id}>
                        <TableCell>
                          {format(new Date(auditoria.data), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{getNomeLoja(auditoria.loja_id)}</TableCell>
                        <TableCell>{getNomeUsuario(auditoria.usuario_id)}</TableCell>
                        <TableCell className={`font-medium ${
                          auditoria.pontuacao_total > 0 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {auditoria.pontuacao_total.toFixed(1)}
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
                    <span className="text-3xl font-bold">{auditorias.length}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground">Lojas Auditadas</span>
                    <span className="text-3xl font-bold">
                      {new Set(auditorias.map(a => a.loja_id)).size}
                    </span>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Distribuição de Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Aprovadas</span>
                    <span className="text-sm font-medium">
                      {auditorias.filter(a => a.pontuacao_total > 5).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Melhorias Necessárias</span>
                    <span className="text-sm font-medium">
                      {auditorias.filter(a => a.pontuacao_total > 0 && a.pontuacao_total <= 5).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Críticas</span>
                    <span className="text-sm font-medium">
                      {auditorias.filter(a => a.pontuacao_total <= 0).length}
                    </span>
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
                          auditorias.length > 0 
                            ? Math.min(
                                Math.max(
                                  (auditorias.reduce((acc, curr) => acc + curr.pontuacao_total, 0) / auditorias.length + 10) * 5, 
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
                    {auditorias.length > 0 
                      ? (auditorias.reduce((acc, curr) => acc + curr.pontuacao_total, 0) / auditorias.length).toFixed(1) 
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Principais Problemas</CardTitle>
              <CardDescription>
                Pontos críticos mais frequentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditorias.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    Com base nas auditorias realizadas, as seções com maior incidência de pontos críticos são:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-danger"></div>
                      <span>Limpeza (3 ocorrências)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-danger"></div>
                      <span>Organização (2 ocorrências)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      <span>Atendimento (1 ocorrência)</span>
                    </li>
                  </ul>
                  <div className="text-sm text-muted-foreground mt-4">
                    Recomendação: Focar em treinamento de equipe para melhorar os aspectos de limpeza e organização das lojas.
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
