
// Re-export functionality from structured modules
// This file is kept for backward compatibility
import { generatePDF } from './pdf/pdfGenerator';

export const exportToPdf = generatePDF;

export { defaultPdfOptions } from './pdf/pdfOptions';
