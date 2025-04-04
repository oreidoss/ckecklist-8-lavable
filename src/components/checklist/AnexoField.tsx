
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Paperclip, Upload } from 'lucide-react';

interface AnexoFieldProps {
  perguntaId: string;
  anexoUrl: string;
  isUploading: boolean;
  handleFileUpload: (perguntaId: string, file: File) => void;
}

const AnexoField: React.FC<AnexoFieldProps> = ({
  perguntaId,
  anexoUrl,
  isUploading,
  handleFileUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && perguntaId) {
      handleFileUpload(perguntaId, file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border rounded-lg p-1 bg-gray-50">
      <h3 className="text-xs font-medium mb-1">Anexo/Foto</h3>
      <div className="flex gap-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex-1 text-xs h-7"
        >
          {isUploading ? (
            <Upload className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Paperclip className="h-3 w-3 mr-1" />
          )}
          {isUploading ? 'Enviando...' : anexoUrl ? 'Alterar anexo' : 'Adicionar anexo'}
        </Button>
      </div>
      {anexoUrl && (
        <div className="mt-1 text-[10px] text-blue-500 truncate">
          <a href={anexoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {anexoUrl.split('/').pop()}
          </a>
        </div>
      )}
    </div>
  );
};

export default AnexoField;
