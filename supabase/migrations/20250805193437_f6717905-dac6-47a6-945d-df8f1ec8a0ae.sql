-- Atualizar status da auditoria para concluido quando todas as seções estão 100% completas
UPDATE auditorias 
SET status = 'concluido' 
WHERE id = '86a72e90-7e7c-4cd8-b8f5-7863643da561' 
  AND status = 'em_andamento';