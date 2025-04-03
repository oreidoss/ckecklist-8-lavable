
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';

// PDF export options
export const defaultPdfOptions = {
  margin: 1,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
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
  
  // Add some styling for the PDF
  const style = document.createElement('style');
  style.innerHTML = `
    body { font-family: 'Helvetica', 'Arial', sans-serif; }
    .pdf-header { text-align: center; margin-bottom: 20px; }
    .pdf-logo { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .section-title { margin-top: 20px; font-size: 16px; font-weight: bold; }
    .negative-score { color: red; }
  `;
  element.appendChild(style);
  
  // Convert to PDF and download
  html2pdf().set(options).from(element).save();
  
  toast({
    title: "PDF Exportado",
    description: successMessage,
  });
};
