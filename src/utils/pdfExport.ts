
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';

// PDF export options
export const defaultPdfOptions = {
  margin: 1,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2,
    useCORS: true,
    logging: false,
    letterRendering: true,
    allowTaint: false
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
  
  // Remove any ScrollArea components that might interfere with rendering
  const scrollAreas = element.querySelectorAll('.scroll-area');
  scrollAreas.forEach(scrollArea => {
    // Replace the scroll area with its content
    const content = scrollArea.querySelector('.scrollbar-content');
    if (content && scrollArea.parentNode) {
      scrollArea.parentNode.replaceChild(content, scrollArea);
    }
  });
  
  // Remove any buttons, tooltips, or UI controls that shouldn't be in the PDF
  const uiElements = element.querySelectorAll('button, [role="tooltip"], .hover-card');
  uiElements.forEach(el => {
    el.parentNode?.removeChild(el);
  });
  
  // Add some styling for the PDF
  const style = document.createElement('style');
  style.innerHTML = `
    @page { margin: 1cm; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; }
    .pdf-header { text-align: center; margin-bottom: 20px; }
    .pdf-logo { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .section-title { margin-top: 20px; font-size: 16px; font-weight: bold; }
    .negative-score { color: red; }
    
    /* Ensure all content is visible */
    .pdf-container * { overflow: visible !important; }
    .card { break-inside: avoid; margin-bottom: 15px; page-break-inside: avoid; }
    
    /* Remove any fixed positioning */
    * { position: static !important; }
    
    /* Ensure proper rendering of charts and graphs */
    svg, canvas { max-width: 100%; height: auto; }
  `;
  element.appendChild(style);
  
  // Set explicit dimensions for the container
  element.style.width = '210mm'; // A4 width
  element.style.minHeight = '297mm'; // A4 height
  element.style.overflow = 'visible';
  
  // Ensure the content flows properly
  Array.from(element.querySelectorAll('*')).forEach(el => {
    (el as HTMLElement).style.overflow = 'visible';
    (el as HTMLElement).style.breakInside = 'avoid';
  });
  
  // Configure and generate PDF
  const pdfOptions = {
    ...defaultPdfOptions,
    ...options,
    html2canvas: {
      ...(options?.html2canvas || defaultPdfOptions.html2canvas),
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      height: element.scrollHeight
    }
  };
  
  // Convert to PDF and download
  html2pdf().set(pdfOptions).from(element).save();
  
  toast({
    title: "PDF Exportado",
    description: successMessage,
  });
};
