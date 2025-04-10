
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';

interface AnexoFieldProps {
  perguntaId: string;
  fileUrl: string;
  isUploading: boolean;
  onFileUpload: (file: File) => void;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log(`Arquivo selecionado para pergunta ${perguntaId}:`, e.target.files[0].name);
      onFileUpload(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    } else if (disabled) {
      console.log("Upload desativado no modo visualização");
    }
  };

  return (
    <div className="mt-2 p-2 bg-white border border-gray-200 rounded-md">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
        disabled={disabled}
      />
      
      {!fileUrl && !isUploading && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Nenhum anexo</span>
          {!disabled && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              <Paperclip className="mr-1 h-3 w-3" />
              Anexar
            </Button>
          )}
        </div>
      )}
      
      {isUploading && (
        <div className="text-xs text-gray-500">Enviando arquivo...</div>
      )}
      
      {fileUrl && !isUploading && (
        <div className="flex justify-between items-center">
          <div className="text-xs">
            {fileUrl.includes('image') ? (
              <div>
                <div className="text-xs text-gray-700 mb-1">Imagem anexada:</div>
                <img src={fileUrl} alt="Anexo" className="max-w-full max-h-32 object-contain" />
              </div>
            ) : (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Ver anexo
              </a>
            )}
          </div>
          
          {!disabled && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              <Paperclip className="mr-1 h-3 w-3" />
              Trocar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AnexoField;
