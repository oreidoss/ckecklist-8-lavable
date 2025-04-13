
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { generatePdf } from "./pdf-generator.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  auditoriaId: string;
  lojaName: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Função send-report-email chamada");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Recebida requisição OPTIONS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentando ler o corpo da requisição");
    const text = await req.text();
    console.log("Corpo da requisição:", text);
    
    let data: ReportEmailRequest;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      throw new Error(`Erro ao processar corpo da requisição: ${e.message}`);
    }
    
    const { auditoriaId, lojaName, userEmail, userName } = data;
    
    console.log("Dados recebidos:", { auditoriaId, lojaName, userEmail, userName });
    
    if (!auditoriaId || !lojaName || !userEmail) {
      throw new Error("Dados incompletos para envio do email");
    }

    // Generate the report PDF
    console.log("Gerando PDF para auditoria:", auditoriaId);
    const pdfBuffer = await generatePdf(auditoriaId);
    console.log("PDF gerado com sucesso");
    
    // Format current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    
    // Send email to admin
    console.log("Enviando email para admin");
    const adminEmail = await resend.emails.send({
      from: "Checklist 9.0 <onboarding@resend.dev>",
      to: ["rogerio@oreidoscatalogos.com.br"],
      subject: `Mais um checklist finalizado - ${formattedDate}`,
      html: `
        <h1>Um novo checklist foi finalizado!</h1>
        <p>O checklist da loja <strong>${lojaName}</strong> foi finalizado em ${formattedDate}.</p>
        <p>Finalizado por: ${userName}</p>
        <p>O relatório completo está em anexo.</p>
        <p>Atenciosamente,<br>Sistema Checklist 9.0</p>
      `,
      attachments: [
        {
          filename: `Checklist_${lojaName}_${formattedDate}.pdf`,
          content: pdfBuffer
        }
      ]
    });
    console.log("Email para admin enviado:", adminEmail);
    
    // Send email to user
    console.log("Enviando email para usuário:", userEmail);
    const userEmailResponse = await resend.emails.send({
      from: "Checklist 9.0 <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Checklist da loja ${lojaName} finalizado - ${formattedDate}`,
      html: `
        <h1>Checklist finalizado com sucesso!</h1>
        <p>O checklist da loja <strong>${lojaName}</strong> foi finalizado em ${formattedDate}.</p>
        <p>O relatório completo está em anexo.</p>
        <p>Atenciosamente,<br>Sistema Checklist 9.0</p>
      `,
      attachments: [
        {
          filename: `Checklist_${lojaName}_${formattedDate}.pdf`,
          content: pdfBuffer
        }
      ]
    });
    console.log("Email para usuário enviado:", userEmailResponse);

    console.log("Emails enviados com sucesso");

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmail, 
      userEmailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending report email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
