
import html2pdf from 'html2pdf.js';
import { prepareElementForPDF, createTemporaryContainer } from './pdfElementPreparer';
import { createPdfOptions } from './pdfOptions';

/**
 * Generates a PDF from an HTML element and returns it as base64 string
 */
export const generatePdfBase64 = (element: HTMLElement, options = {}): Promise<string> => {
  // Create a clone of the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Prepare the element for PDF generation
  const preparedElement = prepareElementForPDF(clonedElement);
  
  // Create temporary container for PDF generation
  const container = createTemporaryContainer(preparedElement);
  
  // Configure PDF options with outputType set to 'blob'
  const pdfOptions = createPdfOptions({
    ...options,
    jsPDF: {
      ...(options as any).jsPDF,
      orientation: 'portrait',
      unit: 'cm',
      format: 'a4'
    },
    output: 'blob'
  });
  
  // Return a promise that resolves when the PDF is generated
  return new Promise((resolve, reject) => {
    html2pdf()
      .from(preparedElement)
      .set(pdfOptions)
      .outputPdf('blob')
      .then(async (blob: Blob) => {
        // Clean up temporary container
        document.body.removeChild(container);
        
        // Convert blob to base64
        const base64 = await blobToBase64(blob);
        resolve(base64);
      })
      .catch(error => {
        console.error('Error generating PDF base64:', error);
        document.body.removeChild(container);
        reject(error);
      });
  });
};

/**
 * Convert a Blob to base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default generatePdfBase64;
