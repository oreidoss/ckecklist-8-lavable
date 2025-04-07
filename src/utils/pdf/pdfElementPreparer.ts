
// Functions to prepare DOM elements for PDF export

// Clean up scroll areas by extracting their content
export const extractScrollAreaContent = (element: HTMLElement): void => {
  const scrollAreas = element.querySelectorAll('.scroll-area, [data-radix-scroll-area-viewport]');
  scrollAreas.forEach(scrollArea => {
    const content = scrollArea.querySelector('[data-radix-scroll-area-viewport], .scrollbar-content, .scroll-content');
    if (content && scrollArea.parentNode) {
      const container = document.createElement('div');
      container.innerHTML = content.innerHTML;
      container.className = 'pdf-extracted-content';
      scrollArea.parentNode.replaceChild(container, scrollArea);
    }
  });
};

// Remove UI elements that shouldn't appear in the PDF
export const removeUIElements = (element: HTMLElement): void => {
  const uiElements = element.querySelectorAll('button, [role="tooltip"], .hover-card, .dialog-overlay, .dialog-content');
  uiElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
};

// Optimize cards for PDF format
export const optimizeCardsForPDF = (element: HTMLElement): void => {
  const cards = element.querySelectorAll('.card');
  cards.forEach(card => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.marginBottom = '8px';
    htmlCard.style.padding = '8px';
    
    // Make card headers more compact
    const cardHeader = htmlCard.querySelector('.card-header');
    if (cardHeader) {
      (cardHeader as HTMLElement).style.padding = '8px';
      (cardHeader as HTMLElement).style.paddingBottom = '4px';
    }
    
    // Make card content more compact
    const cardContent = htmlCard.querySelector('.card-content');
    if (cardContent) {
      (cardContent as HTMLElement).style.padding = '8px';
    }
  });
};

// Reduce spacing between elements
export const reduceElementSpacing = (element: HTMLElement): void => {
  const spacedElements = element.querySelectorAll('.space-y-6, .space-y-4');
  spacedElements.forEach(el => {
    (el as HTMLElement).style.gap = '8px';
    (el as HTMLElement).style.marginTop = '0';
    
    // Also process child elements to reduce spacing
    Array.from(el.children).forEach((child, index) => {
      (child as HTMLElement).style.marginTop = index === 0 ? '0' : '8px';
      (child as HTMLElement).style.marginBottom = '0';
    });
  });
};

// Ensure proper element styling for PDF
export const optimizeElementsForPDF = (element: HTMLElement): void => {
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
};

// Apply all optimizations to prepare element for PDF export
export const prepareElementForPDF = (element: HTMLElement): HTMLElement => {
  extractScrollAreaContent(element);
  removeUIElements(element);
  optimizeCardsForPDF(element);
  reduceElementSpacing(element);
  optimizeElementsForPDF(element);
  
  // Apply general styling for PDF
  element.style.width = '210mm'; // A4 width
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.position = 'relative';
  element.style.padding = '0.3cm';
  element.style.boxSizing = 'border-box';
  
  // Add PDF styles
  const pdfStyles = createPdfStyles();
  element.appendChild(pdfStyles);
  
  return element;
};

// Helper function to create a temporary container for the element
export const createTemporaryContainer = (element: HTMLElement): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.backgroundColor = '#ffffff';
  container.appendChild(element);
  document.body.appendChild(container);
  
  return container;
};

import { createPdfStyles } from './pdfStyles';
