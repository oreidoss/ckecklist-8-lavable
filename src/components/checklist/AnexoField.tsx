
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Paperclip, Loader2 } from 'lucide-react';

interface AnexoFieldProps {
  perguntaId: string;
  fileUrl: string;
  isUploading: boolean;
  onFileUpload: (perguntaId: string, file: File) => void;
  disabled?: boolean;
}

const AnexoField: React.FC<AnexoFieldProps> = ({
  perguntaId,
  fileUrl,
  isUploading,
  onFileUpload,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !disabled) {
      onFileUpload(perguntaId, file);
    }
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
      
      <div className="flex">
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading || disabled}
            className="text-xs h-7 border-[#00bfa5] text-[#00bfa5] py-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Enviar arquivo
              </>
            )}
          </Button>
        )}
        
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center text-xs text-blue-600 hover:underline"
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
