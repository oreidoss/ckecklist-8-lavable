-- Atualizar status de todas as auditorias que estão 100% completas
-- Uma auditoria está completa quando tem respostas para todas as perguntas obrigatórias

WITH auditoria_stats AS (
  SELECT 
    a.id as auditoria_id,
    a.status,
    -- Contar total de seções
    (SELECT COUNT(*) FROM secoes) as total_secoes,
    -- Contar quantas seções têm respostas para todas as perguntas obrigatórias
    COUNT(DISTINCT CASE 
      WHEN secao_completeness.secao_completa = true THEN s.id 
    END) as secoes_completas
  FROM auditorias a
  CROSS JOIN secoes s
  LEFT JOIN LATERAL (
    SELECT 
      s.id as secao_id,
      -- Uma seção está completa quando tem respostas para todas as perguntas obrigatórias
      -- (excluindo as 2 últimas perguntas de cada seção que são para observações/anexos)
      CASE WHEN 
        (SELECT COUNT(*) 
         FROM perguntas p 
         WHERE p.secao_id = s.id
         AND EXISTS (
           SELECT 1 FROM respostas r 
           WHERE r.auditoria_id = a.id 
           AND r.pergunta_id = p.id 
           AND r.resposta IS NOT NULL 
           AND r.resposta != ''
         )
        ) >= 
        GREATEST(
          (SELECT COUNT(*) FROM perguntas p WHERE p.secao_id = s.id) - 2,
          0
        )
      THEN true 
      ELSE false 
      END as secao_completa
  ) secao_completeness ON true
  WHERE a.status = 'em_andamento'
  GROUP BY a.id, a.status
)

UPDATE auditorias 
SET status = 'concluido'
WHERE id IN (
  SELECT auditoria_id 
  FROM auditoria_stats 
  WHERE secoes_completas = total_secoes
    AND status = 'em_andamento'
);