
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';
import { prepareElementForPDF, createTemporaryContainer } from './pdfElementPreparer';
import { createPdfOptions } from './pdfOptions';

// Generate PDF from an element
export const generatePDF = (
  element: HTMLElement,
  options = {},
  successMessage = "O PDF foi gerado com sucesso!"
): Promise<void> => {
  // Create a clone of the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Prepare the element for PDF generation
  const preparedElement = prepareElementForPDF(clonedElement);
  
  // Create temporary container for PDF generation
  const container = createTemporaryContainer(preparedElement);
  
  // Configure PDF options
  const pdfOptions = createPdfOptions(options);
  
  // Return a promise that resolves when the PDF is generated
  return new Promise((resolve, reject) => {
    html2pdf()
      .from(preparedElement)
      .set(pdfOptions)
      .save()
      .then(() => {
        // Clean up temporary container
        document.body.removeChild(container);
        
        toast({
          title: "PDF Exportado",
          description: successMessage,
        });
        
        resolve();
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(container);
        
        toast({
          title: "Erro ao exportar PDF",
          description: "Houve um problema ao gerar o PDF. Tente novamente.",
          variant: "destructive"
        });
        
        reject(error);
      });
  });
};
