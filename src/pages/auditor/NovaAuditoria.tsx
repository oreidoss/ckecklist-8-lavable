
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];

const NovaAuditoria: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedLojaId = searchParams.get('loja');
  
  const [lojaId, setLojaId] = useState<string>(preselectedLojaId || "");
  const [usuarioId, setUsuarioId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch lojas from Supabase
  const { data: lojas, isLoading: loadingLojas } = useQuery({
    queryKey: ['lojas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lojas').select('*');
      if (error) throw error;
      return data as Loja[];
    }
  });
  
  // Fetch usuarios from Supabase
  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) throw error;
      return data as Usuario[];
    }
  });
  
  const handleIniciarAuditoria = async () => {
    if (!lojaId || !usuarioId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione a loja e o auditor para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Cria uma nova auditoria no Supabase
    const { data, error } = await supabase
      .from('auditorias')
      .insert({
        loja_id: lojaId,
        usuario_id: usuarioId,
        data: new Date().toISOString(),
        status: 'em_andamento',
        pontuacao_total: 0
      })
      .select();
    
    if (error) {
      toast({
        title: "Erro ao criar auditoria",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    if (data && data.length > 0) {
      // Redireciona para a página de checklist
      navigate(`/checklist/${data[0].id}`);
    }
  };
  
  if (loadingLojas || loadingUsuarios) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle 
        title="Nova Auditoria" 
        description="Selecione a loja e o auditor para iniciar uma nova auditoria"
      />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Auditoria</CardTitle>
          <CardDescription>
            Preencha as informações para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="loja" className="text-base font-medium">
              Selecione a Loja
            </label>
            <Select value={lojaId} onValueChange={setLojaId}>
              <SelectTrigger id="loja" className="w-full h-12">
                <SelectValue placeholder="Escolha uma loja" />
              </SelectTrigger>
              <SelectContent>
                {lojas?.map((loja) => (
                  <SelectItem key={loja.id} value={loja.id.toString()}>
                    {loja.nome} ({loja.numero})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="auditor" className="text-base font-medium">
              Selecione o Auditor
            </label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger id="auditor" className="w-full h-12">
                <SelectValue placeholder="Escolha um auditor" />
              </SelectTrigger>
              <SelectContent>
                {usuarios?.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleIniciarAuditoria} 
            className="w-full h-12 text-base"
          >
            Iniciar Auditoria
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NovaAuditoria;
