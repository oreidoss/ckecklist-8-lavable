
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Mail, Loader2 } from 'lucide-react';
import { EditInformacoesDialog } from './EditInformacoesDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generatePdfBase64 } from '@/utils/pdf';

interface RelatorioActionsProps {
  auditoria: any;
  usuarios: any[];
  reportRef: React.RefObject<HTMLDivElement>;
  refetchAuditoria: () => void;
  exportarPDF: () => void;
}

export const RelatorioActions: React.FC<RelatorioActionsProps> = ({ 
  auditoria, 
  usuarios, 
  reportRef,
  refetchAuditoria, 
  exportarPDF 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Filter usuarios by role if available
  const supervisores = usuarios.filter(u => u.role === 'supervisor' || !u.role);
  const gerentes = usuarios.filter(u => u.role === 'gerente' || !u.role);

  const handleSendEmail = async () => {
    if (!auditoria?.loja?.nome || !auditoria?.id) {
      toast({
        title: "Erro",
        description: "Dados da loja ou auditoria incompletos",
        variant: "destructive",
      });
      return;
    }

    if (!reportRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // First generate PDF as base64 string
      const pdfBase64 = await generatePdfBase64(reportRef.current, {
        filename: `Checklist_${auditoria.loja.nome}_${new Date().toLocaleDateString('pt-BR')}.pdf`,
      });
      
      console.log("PDF gerado com sucesso, tamanho:", pdfBase64.length);
      
      // Then send PDF to edge function
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: { 
          auditoriaId: auditoria.id,
          lojaName: auditoria.loja.nome,
          userEmail: auditoria.usuario?.email,
          userName: auditoria.usuario?.nome,
          pdfBase64: pdfBase64 // Send the PDF as base64
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "O relatório foi enviado por email com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro ao tentar enviar o email",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <div className="flex space-x-2">
        <EditInformacoesDialog 
          auditoria={auditoria} 
          usuarios={usuarios}
          supervisores={supervisores}
          gerentes={gerentes}
          refetchAuditoria={refetchAuditoria} 
        />
        
        <Button onClick={exportarPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>

        <Button 
          onClick={handleSendEmail} 
          disabled={isSendingEmail}
          variant="outline"
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Enviar por Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
