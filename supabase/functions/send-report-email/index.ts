
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { generatePdf } from "./pdf-generator.ts";

// Início da função - registra log para garantir que está sendo chamada
console.log("Função send-report-email inicializada");

// Verificar configuração da API key
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("ERRO CRÍTICO: RESEND_API_KEY não está definida no ambiente");
} else {
  console.log("RESEND_API_KEY encontrada:", RESEND_API_KEY ? "Presente" : "Ausente");
}

const resend = new Resend(RESEND_API_KEY);

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
  console.log("Request recebida:", req.method);
  console.log("Request URL:", req.url);
  console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Respondendo requisição OPTIONS (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentando ler corpo da requisição...");
    const requestData = await req.json();
    console.log("Dados recebidos na requisição:", JSON.stringify(requestData));
    
    const { auditoriaId, lojaName, userEmail, userName }: ReportEmailRequest = requestData;
    
    console.log("Dados de email validados:", { auditoriaId, lojaName, userEmail, userName });
    
    if (!auditoriaId || !lojaName || !userEmail) {
      console.error("Dados incompletos para envio do email:", { auditoriaId, lojaName, userEmail });
      throw new Error("Dados incompletos para envio do email");
    }

    console.log("Iniciando geração do PDF...");
    try {
      // Generate the report PDF
      const pdfBuffer = await generatePdf(auditoriaId);
      console.log("PDF gerado com sucesso, tamanho:", pdfBuffer.length);
      
      // Format current date
      const today = new Date();
      const formattedDate = today.toLocaleDateString('pt-BR');
      
      console.log("Enviando email para administrador...");
      // Send email to admin (Rogerio)
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
      console.log("Email do administrador enviado com sucesso:", adminEmail);
      
      console.log("Enviando email para o usuário...");
      // Send email to user who completed the checklist
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
      console.log("Email do usuário enviado com sucesso:", userEmailResponse);

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
    } catch (pdfError: any) {
      console.error("Erro na geração do PDF:", pdfError);
      console.error("Stack trace do erro de PDF:", pdfError.stack);
      throw new Error("Falha na geração do PDF: " + pdfError.message);
    }
  } catch (error: any) {
    console.error("Erro na função edge:", error);
    console.error("Detalhes do erro:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.cause,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Registra log da inicialização do servidor
console.log("Iniciando servidor da função send-report-email");
serve(handler);
