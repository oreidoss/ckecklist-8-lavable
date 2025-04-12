
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Buffer } from "https://deno.land/std@0.182.0/io/buffer.ts";
import * as puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generatePdf(auditoriaId: string): Promise<Buffer> {
  try {
    // Fetch audit data
    const { data: auditoria, error: auditoriaError } = await supabase
      .from('auditorias')
      .select('*, loja:lojas(*), usuario:usuarios(*)')
      .eq('id', auditoriaId)
      .single();

    if (auditoriaError) throw auditoriaError;

    // Fetch related data
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('*')
      .eq('auditoria_id', auditoriaId);

    if (respostasError) throw respostasError;

    const { data: perguntas, error: perguntasError } = await supabase
      .from('perguntas')
      .select('*');

    if (perguntasError) throw perguntasError;

    const { data: secoes, error: secoesError } = await supabase
      .from('secoes')
      .select('*');

    if (secoesError) throw secoesError;

    // Fetch previous audits for the same store
    const { data: auditorias, error: auditoriasError } = await supabase
      .from('auditorias')
      .select('*')
      .eq('loja_id', auditoria.loja_id)
      .order('data', { ascending: false });

    if (auditoriasError) throw auditoriasError;

    // Generate HTML content for the report
    const reportHtml = generateReportHtml({
      auditoria,
      loja: auditoria.loja,
      respostas,
      perguntas,
      secoes,
      auditorias
    });

    // Launch puppeteer to generate PDF
    const browser = await puppeteer.launch({ 
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(reportHtml, { waitUntil: "networkidle0" });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm"
      }
    });
    
    await browser.close();
    
    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

function generateReportHtml(data: any) {
  // Create a basic HTML report template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Auditoria</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
        h2 { color: #444; font-size: 18px; margin-top: 30px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Relatório de Auditoria</h1>
          <p>Loja: ${data.loja.nome} (${data.loja.numero})</p>
          <p>Data: ${new Date(data.auditoria.data).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      
      <div class="section">
        <h2>Informações Gerais</h2>
        <table>
          <tr>
            <th>Supervisor</th>
            <td>${data.auditoria.supervisor || 'Não informado'}</td>
          </tr>
          <tr>
            <th>Gerente</th>
            <td>${data.auditoria.gerente || 'Não informado'}</td>
          </tr>
          <tr>
            <th>Pontuação Total</th>
            <td>${data.auditoria.pontuacao_total || 0}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>${data.auditoria.status === 'concluido' ? 'Concluído' : 'Em andamento'}</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Pontuação por Seção</h2>
        <table>
          <tr>
            <th>Seção</th>
            <th>Pontuação</th>
          </tr>
          ${generateSecoesPontuacao(data.secoes, data.perguntas, data.respostas)}
        </table>
      </div>
      
      <div class="section">
        <h2>Pontos de Atenção</h2>
        ${generatePontosAtencao(data.perguntas, data.respostas, data.secoes)}
      </div>
      
      <div class="footer">
        © 2025 O REI DOS CATÁLOGOS - Rogerio Carvalheira
      </div>
    </body>
    </html>
  `;
}

function generateSecoesPontuacao(secoes: any[], perguntas: any[], respostas: any[]) {
  let html = '';
  
  secoes.forEach(secao => {
    const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
    const respostasSecao = respostas.filter(r => 
      perguntasSecao.some(p => p.id === r.pergunta_id)
    );
    
    const pontuacao = respostasSecao.reduce((acc, r) => acc + (r.pontuacao_obtida || 0), 0);
    
    html += `
      <tr>
        <td>${secao.nome}</td>
        <td>${pontuacao}</td>
      </tr>
    `;
  });
  
  return html;
}

function generatePontosAtencao(perguntas: any[], respostas: any[], secoes: any[]) {
  const itensCriticos = respostas
    .filter(r => r.pontuacao_obtida !== undefined && r.pontuacao_obtida <= 0);
  
  if (itensCriticos.length === 0) {
    return "<p>Nenhum ponto crítico encontrado.</p>";
  }
  
  let html = '<table><tr><th>Seção</th><th>Pergunta</th><th>Observação</th></tr>';
  
  itensCriticos.forEach(item => {
    const pergunta = perguntas.find(p => p.id === item.pergunta_id);
    const secao = secoes.find(s => pergunta && s.id === pergunta.secao_id);
    
    html += `
      <tr>
        <td>${secao ? secao.nome : 'Seção não encontrada'}</td>
        <td>${pergunta ? pergunta.texto : 'Pergunta não encontrada'}</td>
        <td>${item.observacao || 'Sem observação'}</td>
      </tr>
    `;
  });
  
  html += '</table>';
  return html;
}
