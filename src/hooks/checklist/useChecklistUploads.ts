
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage file uploads for a checklist
 */
export const useChecklistUploads = (auditoriaId: string | undefined) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (perguntaId: string, file: File, respostasExistentes: any[]) => {
    if (!auditoriaId) {
      const errorMsg = "ID da auditoria não fornecido";
      setUploadErrors(prev => ({ ...prev, [perguntaId]: errorMsg }));
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      const errorMsg = "Nenhum arquivo selecionado";
      setUploadErrors(prev => ({ ...prev, [perguntaId]: errorMsg }));
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "O arquivo é muito grande. O tamanho máximo é de 10MB.";
      setUploadErrors(prev => ({ ...prev, [perguntaId]: errorMsg }));
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    setUploading(prev => ({ ...prev, [perguntaId]: true }));
    // Clear any previous errors
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[perguntaId];
      return newErrors;
    });
    
    try {
      // Create the storage bucket if it doesn't exist (will be handled by Supabase)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const filePath = `${auditoriaId}/${perguntaId}_${fileName}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('auditoria-anexos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('auditoria-anexos')
        .getPublicUrl(filePath);
      
      if (!publicUrl) {
        throw new Error("Não foi possível obter URL pública para o arquivo");
      }
      
      setFileUrls(prev => ({ 
        ...prev, 
        [perguntaId]: publicUrl 
      }));
      
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            anexo_url: publicUrl
          })
          .eq('id', respostaExistente.id);
        
        if (error) throw new Error(`Erro ao atualizar resposta com URL do arquivo: ${error.message}`);
        
        toast({
          title: "Arquivo enviado",
          description: "O arquivo foi enviado com sucesso."
        });
      } else {
        // If there's no response yet, we'll create a response with just the file URL
        const { error } = await supabase
          .from('respostas')
          .insert({
            auditoria_id: auditoriaId,
            pergunta_id: perguntaId,
            anexo_url: publicUrl
          });
          
        if (error) throw new Error(`Erro ao criar nova resposta com URL do arquivo: ${error.message}`);
        
        toast({
          title: "Arquivo enviado",
          description: "O arquivo foi enviado com sucesso."
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao fazer upload do arquivo:", error);
      setUploadErrors(prev => ({ ...prev, [perguntaId]: errorMessage }));
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [perguntaId]: false }));
    }
  };

  const clearUploadError = (perguntaId: string) => {
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[perguntaId];
      return newErrors;
    });
  };

  return { 
    uploading, 
    fileUrls, 
    uploadErrors,
    handleFileUpload,
    clearUploadError
  };
};
