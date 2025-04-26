
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

console.log("Função send-report-email inicializada");

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("ERRO CRÍTICO: RESEND_API_KEY não está definida no ambiente");
} else {
  console.log("RESEND_API_KEY encontrada");
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
  pdfBase64: string; // New field to receive the PDF as base64
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Request recebida:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Respondendo requisição OPTIONS (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentando ler corpo da requisição...");
    const requestData = await req.json();
    console.log("Dados recebidos:", JSON.stringify({
      auditoriaId: requestData.auditoriaId,
      lojaName: requestData.lojaName,
      userEmail: requestData.userEmail,
      userName: requestData.userName,
      pdfBase64Length: requestData.pdfBase64?.length || 0
    }));
    
    const { auditoriaId, lojaName, userEmail, userName, pdfBase64 }: ReportEmailRequest = requestData;
    
    if (!auditoriaId || !lojaName || !userEmail || !pdfBase64) {
      console.error("Dados incompletos:", { auditoriaId, lojaName, userEmail, pdfBase64: !!pdfBase64 });
      throw new Error("Dados incompletos para envio do email");
    }

    // Convert base64 string to Uint8Array buffer
    console.log("Convertendo PDF base64 para buffer...");
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    console.log("PDF convertido, tamanho:", pdfBuffer.length);
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    
    console.log(`Enviando email para ${userEmail}...`);
    const data = {
      from: "Checklist 9.0 <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Checklist da loja ${lojaName} finalizado - ${formattedDate}`,
      html: `
        <h1>Checklist finalizado com sucesso!</h1>
        <p>Olá ${userName || "usuário"},</p>
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
    };
    
    console.log("Configuração do email:", JSON.stringify({
      from: data.from,
      to: data.to,
      subject: data.subject,
      attachmentSize: pdfBuffer.length
    }));
    
    const emailResponse = await resend.emails.send(data);
    
    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
