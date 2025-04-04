
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';

// PDF export options
export const defaultPdfOptions = {
  margin: 0.5,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2,
    useCORS: true,
    logging: true,
    letterRendering: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  },
  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
};

export const exportToPdf = (
  elementRef: React.RefObject<HTMLElement>, 
  options = defaultPdfOptions,
  successMessage = "O relatório foi exportado com sucesso!"
) => {
  if (!elementRef.current) return;
  
  // Clone the report element to modify it for PDF
  const element = elementRef.current.cloneNode(true) as HTMLElement;
  
  // Remove ScrollArea components and extract their content
  const scrollAreas = element.querySelectorAll('.scroll-area, [data-radix-scroll-area-viewport]');
  scrollAreas.forEach(scrollArea => {
    // Replace the scroll area with its content
    const content = scrollArea.querySelector('[data-radix-scroll-area-viewport], .scrollbar-content, .scroll-content');
    if (content && scrollArea.parentNode) {
      const container = document.createElement('div');
      container.innerHTML = content.innerHTML;
      container.className = 'pdf-extracted-content';
      scrollArea.parentNode.replaceChild(container, scrollArea);
    }
  });
  
  // Remove any buttons, tooltips, or UI controls that shouldn't be in the PDF
  const uiElements = element.querySelectorAll('button, [role="tooltip"], .hover-card, .dialog-overlay, .dialog-content');
  uiElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  // Add some styling for the PDF
  const style = document.createElement('style');
  style.innerHTML = `
    @page { margin: 0.5cm; size: A4; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #000; background: #fff; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    .pdf-header { text-align: center; margin-bottom: 20px; }
    .pdf-logo { font-size: 24px; font-weight: bold; }
    .pdf-container { width: 100%; background: #fff; color: #000; }
    .pdf-extracted-content { width: 100%; display: block; }
    
    table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: auto; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .section-title { margin-top: 20px; font-size: 16px; font-weight: bold; }
    .negative-score { color: red; }
    
    /* Ensure all content is visible */
    * { overflow: visible !important; position: static !important; }
    .card { break-inside: avoid; margin-bottom: 15px; page-break-inside: avoid; background: #fff; }
    
    /* Ensure proper rendering of charts and graphs */
    svg, canvas { max-width: 100%; height: auto; }
    
    /* Add space between sections */
    .print-item { margin-bottom: 1cm; page-break-inside: avoid; }
    
    /* Make sure text is black for better printing */
    p, h1, h2, h3, h4, h5, h6, span, div { color: #000 !important; }
  `;
  element.appendChild(style);
  
  // Set explicit dimensions for the container
  element.style.width = '210mm'; // A4 width
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.position = 'relative';
  element.style.padding = '1cm';
  element.style.boxSizing = 'border-box';
  
  // Ensure the content flows properly
  Array.from(element.querySelectorAll('*')).forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.overflow = 'visible';
    
    // Force black text
    if (htmlEl.innerText && !htmlEl.querySelector('svg')) {
      htmlEl.style.color = '#000000';
    }
    
    // Remove any fixed/absolute positioning
    if (htmlEl.style.position === 'fixed' || htmlEl.style.position === 'absolute') {
      htmlEl.style.position = 'static';
    }
  });
  
  // Configure and generate PDF
  const pdfOptions = {
    ...defaultPdfOptions,
    ...options,
    html2canvas: {
      ...(options?.html2canvas || defaultPdfOptions.html2canvas),
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Fixed width for consistency
    }
  };
  
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.backgroundColor = '#ffffff';
  container.appendChild(element);
  document.body.appendChild(container);
  
  // Convert to PDF and download
  html2pdf()
    .from(element)
    .set(pdfOptions)
    .save()
    .then(() => {
      // Remove the temporary container after generating the PDF
      document.body.removeChild(container);
      
      toast({
        title: "PDF Exportado",
        description: successMessage,
      });
    })
    .catch(error => {
      console.error('Error generating PDF:', error);
      document.body.removeChild(container);
      
      toast({
        title: "Erro ao exportar PDF",
        description: "Houve um problema ao gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    });
};
