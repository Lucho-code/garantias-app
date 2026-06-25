-- Ejecutar en el SQL Editor de Supabase
-- Agrega columnas de tracking para no reenviar el mismo aviso cada día

ALTER TABLE public.warranties
  ADD COLUMN IF NOT EXISTS notified_30 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notified_10 BOOLEAN DEFAULT FALSE;

-- Índice para que la query del cron sea rápida
CREATE INDEX IF NOT EXISTS warranties_notifications_idx
  ON public.warranties(expiry_date, notified_30, notified_10)
  WHERE expiry_date >= CURRENT_DATE;

-- Si en el futuro querés resetear los avisos (por ejemplo al editar una garantía):
-- UPDATE warranties SET notified_30 = FALSE, notified_10 = FALSE WHERE id = '<id>';
