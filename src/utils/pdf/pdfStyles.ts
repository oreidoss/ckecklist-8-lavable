
// Create and return PDF-specific styling
export const createPdfStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    @page { margin: 0.3cm; size: A4; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #000; background: #fff; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    .pdf-header { text-align: center; margin-bottom: 10px; }
    .pdf-logo { font-size: 18px; font-weight: bold; }
    .pdf-container { width: 100%; background: #fff; color: #000; }
    .pdf-extracted-content { width: 100%; display: block; }
    
    /* Condensed spacing for cards and sections */
    .card { margin-bottom: 8px !important; padding: 8px !important; }
    .card-header { padding: 8px !important; padding-bottom: 4px !important; }
    .card-content { padding: 8px !important; }
    h1, h2, h3 { margin-top: 8px !important; margin-bottom: 4px !important; }
    p { margin-top: 2px !important; margin-bottom: 2px !important; }
    
    table { width: 100%; border-collapse: collapse; margin: 8px 0; page-break-inside: auto; }
    th, td { border: 1px solid #ddd; padding: 4px; text-align: left; font-size: 11px; }
    th { background-color: #f2f2f2; }
    .section-title { margin-top: 12px; font-size: 14px; font-weight: bold; }
    .negative-score { color: red; }
    
    /* Remove excess white space */
    .space-y-6 { margin-top: 0 !important; }
    .space-y-6 > * { margin-top: 8px !important; margin-bottom: 0 !important; }
    .space-y-4 > * { margin-top: 6px !important; margin-bottom: 0 !important; }
    
    /* Ensure all content is visible */
    * { overflow: visible !important; position: static !important; }
    .card { break-inside: avoid; margin-bottom: 8px; page-break-inside: avoid; background: #fff; }
    
    /* Ensure proper rendering of charts and graphs */
    svg, canvas { max-width: 100%; height: auto; }
    
    /* Compact the print items */
    .print-item { margin-bottom: 8px !important; page-break-inside: avoid; }
    
    /* Make sure text is black for better printing */
    p, h1, h2, h3, h4, h5, h6, span, div { color: #000 !important; }
    
    /* Fix the footer position */
    .pdf-footer { margin-top: 8px !important; }
  `;
  
  return style;
};
