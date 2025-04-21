
import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

export const ExportPerguntasSecoesExcelButton: React.FC = () => {
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["perguntas-secoes-export"],
    queryFn: async () => {
      // Fetch secoes
      const { data: secoes, error: secaoErr } = await supabase
        .from("secoes")
        .select("id, nome")
        .order("nome", { ascending: true });
      if (secaoErr) throw secaoErr;

      // Fetch perguntas
      const { data: perguntas, error: perguntasErr } = await supabase
        .from("perguntas")
        .select("id, texto, secao_id")
        .order("secao_id", { ascending: true });
      if (perguntasErr) throw perguntasErr;

      return { secoes: secoes || [], perguntas: perguntas || [] };
    },
  });

  const handleExport = () => {
    if (!data) return;

    // Map secoes para fácil acesso
    const secaoMap: Record<string, string> = {};
    data.secoes.forEach((secao) => {
      secaoMap[secao.id] = secao.nome;
    });

    // Formatar linhas para Excel
    const rows = data.perguntas.map((pergunta) => ({
      "Seção": secaoMap[pergunta.secao_id] || "Sem seção",
      "Pergunta": pergunta.texto,
    }));

    // Gerar planilha
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perguntas e Seções");

    XLSX.writeFile(wb, "perguntas-secoes.xlsx");

    toast({
      title: "Exportação concluída",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      disabled={isLoading || !data}
      className="flex items-center space-x-2"
    >
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Exportar Perguntas/Seções (Excel)
    </Button>
  );
};
