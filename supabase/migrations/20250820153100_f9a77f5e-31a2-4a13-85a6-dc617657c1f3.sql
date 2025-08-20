-- Adicionar status 'pending_payment' ao enum order_status
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment';