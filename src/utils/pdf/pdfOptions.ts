
// PDF export default options
export const defaultPdfOptions = {
  margin: 0.3,
  filename: 'relatorio-auditoria.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2,
    useCORS: true,
    logging: false,
    letterRendering: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  },
  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
};

// Create custom options by merging with defaults
export const createPdfOptions = (customOptions = {}) => {
  const options = customOptions as Record<string, any>;
  
  return {
    ...defaultPdfOptions,
    ...customOptions,
    html2canvas: {
      ...(defaultPdfOptions.html2canvas),
      ...(options.html2canvas || {}),
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Fixed width for consistency
    }
  };
};
