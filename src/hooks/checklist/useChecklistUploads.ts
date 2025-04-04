
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage file uploads for a checklist
 */
export const useChecklistUploads = (
  auditoriaId: string | undefined,
  setFileUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setUploading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) => {
  const { toast } = useToast();

  const handleFileUpload = async (perguntaId: string, file: File, respostasExistentes: any[]) => {
    if (!auditoriaId || !file) return;
    
    setUploading(prev => ({ ...prev, [perguntaId]: true }));
    
    try {
      // Create the storage bucket if it doesn't exist (will be handled by Supabase)
      const fileExt = file.name.split('.').pop();
      const filePath = `${auditoriaId}/${perguntaId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('auditoria-anexos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('auditoria-anexos')
        .getPublicUrl(filePath);
      
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
        
        if (error) throw error;
        
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
          
        if (error) throw error;
        
        toast({
          title: "Arquivo enviado",
          description: "O arquivo foi enviado com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [perguntaId]: false }));
    }
  };

  return { handleFileUpload };
};
