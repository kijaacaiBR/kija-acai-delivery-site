-- Adicionar colunas necessárias para integração com AbacatePay
ALTER TABLE orders ADD COLUMN IF NOT EXISTS abacate_bill_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pix_payment_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para consultas rápidas por bill_id
CREATE INDEX IF NOT EXISTS idx_orders_abacate_bill_id ON orders(abacate_bill_id);

-- Adicionar o gateway AbacatePay às configurações do site
INSERT INTO site_settings (key, value, type, description) VALUES 
('payment_abacatepay_enabled', 'false', 'boolean', 'AbacatePay habilitado'),
('payment_abacatepay_api_key', '', 'text', 'AbacatePay - API Key'),
('payment_abacatepay_webhook_secret', '', 'text', 'AbacatePay - Webhook Secret')
ON CONFLICT (key) DO NOTHING;