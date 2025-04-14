
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditoriaId, lojaName, userEmail, userName }: ReportEmailRequest = await req.json();
    
    if (!auditoriaId || !lojaName || !userEmail) {
      throw new Error("Dados incompletos para envio do email");
    }

    // Generate the report PDF
    const pdfBuffer = await generatePdf(auditoriaId);
    
    // Format current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    
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

    console.log("Emails sent successfully:", adminEmail, userEmailResponse);

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
