
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Paperclip, Loader2, X } from 'lucide-react';

interface AnexoFieldProps {
  fileUrl: string;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
  perguntaId?: string;
}

const AnexoField: React.FC<AnexoFieldProps> = ({
  fileUrl,
  onFileUpload,
  isUploading,
  disabled = false,
  perguntaId = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadSection, setShowUploadSection] = useState(false);

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !disabled) {
      onFileUpload(file);
      setShowUploadSection(false);
      
      // Clear input to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleShowUploadSection = () => {
    console.log("Mostrando seção de upload");
    setShowUploadSection(true);
  };

  const handleHideUploadSection = () => {
    console.log("Escondendo seção de upload");
    setShowUploadSection(false);
  };

  return (
    <div className="mt-2 space-y-1">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        disabled={disabled}
      />
      
      <div className="flex items-center gap-2">
        {!disabled && !showUploadSection && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShowUploadSection}
            disabled={isUploading || disabled}
            className="text-xs h-7 border-[#00bfa5] text-[#00bfa5] hover:bg-[#00bfa5] hover:text-white py-0"
          >
            <Upload className="h-3 w-3 mr-1" />
            Adicionar anexo
          </Button>
        )}

        {!disabled && showUploadSection && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isUploading || disabled}
              className="text-xs h-7 border-[#00bfa5] text-[#00bfa5] hover:bg-[#00bfa5] hover:text-white py-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 mr-1" />
                  Selecionar arquivo
                </>
              )}
            </Button>
            
            <button
              type="button"
              onClick={handleHideUploadSection}
              className="text-xs h-7 px-2 py-1 rounded border bg-red-100 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancelar
            </button>
          </div>
        )}
        
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-blue-600 hover:underline"
          >
            <Paperclip className="h-3 w-3 mr-1" />
            Ver anexo
          </a>
        )}
      </div>
    </div>
  );
};

export default AnexoField;
