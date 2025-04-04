
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload } from 'lucide-react';
import { Pergunta } from '@/lib/types';

export type RespostaValor = 'Sim' | 'Não' | 'Regular' | 'N/A';

interface ChecklistQuestionProps {
  pergunta: Pergunta;
  index: number;
  resposta: RespostaValor | undefined;
  isLastPergunta: boolean;
  observacao: string;
  anexoUrl: string;
  uploading: boolean;
  handleResposta: (perguntaId: string, resposta: RespostaValor) => void;
  handleObservacaoChange: (perguntaId: string, value: string) => void;
  handleSaveObservacao: (perguntaId: string) => void;
  handleFileUpload: (perguntaId: string, file: File) => void;
}

const ChecklistQuestion: React.FC<ChecklistQuestionProps> = ({
  pergunta,
  index,
  resposta,
  isLastPergunta,
  observacao,
  anexoUrl,
  uploading,
  handleResposta,
  handleObservacaoChange,
  handleSaveObservacao,
  handleFileUpload
}) => {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-6">{pergunta.texto}</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          variant="outline"
          className={`h-12 ${resposta === 'Sim' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Sim')}
        >
          Sim
        </Button>
        <Button
          variant="outline"
          className={`h-12 ${resposta === 'Não' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Não')}
        >
          Não
        </Button>
        <Button
          variant="outline"
          className={`h-12 ${resposta === 'Regular' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'Regular')}
        >
          Regular
        </Button>
        <Button
          variant="outline"
          className={`h-12 ${resposta === 'N/A' ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''}`}
          onClick={() => handleResposta(pergunta.id, 'N/A')}
        >
          N/A
        </Button>
      </div>
      
      <div className="mt-4">
        <label htmlFor={`observacao-${pergunta.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Observação
        </label>
        <div className="flex gap-2">
          <Input
            id={`observacao-${pergunta.id}`}
            type="text"
            placeholder="Adicione uma observação se necessário"
            className="flex-1"
            value={observacao}
            onChange={(e) => handleObservacaoChange(pergunta.id, e.target.value)}
          />
          <Button 
            variant="outline" 
            onClick={() => handleSaveObservacao(pergunta.id)}
            className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLastPergunta && (
        <div className="mt-4">
          <label htmlFor={`file-${pergunta.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Anexar Foto/Arquivo
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                id={`file-${pergunta.id}`}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="flex-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(pergunta.id, file);
                  }
                }}
                disabled={uploading}
              />
              <Button 
                variant="outline"
                disabled={uploading} 
                className={`min-w-[40px] ${uploading ? 'animate-pulse' : ''}`}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            {anexoUrl && (
              <div className="p-2 bg-gray-50 border rounded flex justify-between items-center">
                <a 
                  href={anexoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver anexo
                </a>
              </div>
            )}
            
            {uploading && (
              <div className="text-sm text-gray-500">Enviando arquivo...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistQuestion;
