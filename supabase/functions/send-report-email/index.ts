
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { generatePdf } from "./pdf-generator.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

console.log("Edge function initialized. Checking RESEND_API_KEY:", 
  Deno.env.get("RESEND_API_KEY") ? "Present" : "Missing");

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
  console.log("Request received:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Request data received:", requestData);
    
    const { auditoriaId, lojaName, userEmail, userName }: ReportEmailRequest = requestData;
    
    console.log("Validated email request data:", { auditoriaId, lojaName, userEmail, userName });
    
    if (!auditoriaId || !lojaName || !userEmail) {
      console.error("Missing required email parameters:", { auditoriaId, lojaName, userEmail });
      throw new Error("Dados incompletos para envio do email");
    }

    console.log("Generating PDF report...");
    // Generate the report PDF
    const pdfBuffer = await generatePdf(auditoriaId);
    console.log("PDF generated successfully");
    
    // Format current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    
    console.log("Sending admin email...");
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
    console.log("Admin email sent successfully:", adminEmail);
    
    console.log("Sending user email...");
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
    console.log("User email sent successfully:", userEmailResponse);

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
    console.error("Error in edge function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.cause
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
