
// Export all PDF utilities from a single file
export { generatePDF } from './pdfGenerator';
export { generatePdfBase64 } from './generatePdfBase64';
export { defaultPdfOptions, createPdfOptions } from './pdfOptions';
export { createPdfStyles } from './pdfStyles';
export { 
  prepareElementForPDF, 
  extractScrollAreaContent,
  removeUIElements,
  optimizeCardsForPDF,
  reduceElementSpacing,
  optimizeElementsForPDF,
  createTemporaryContainer
} from './pdfElementPreparer';
