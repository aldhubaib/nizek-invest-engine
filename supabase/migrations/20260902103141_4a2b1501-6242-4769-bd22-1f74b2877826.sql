ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS confidentiality_acknowledged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confidentiality_acknowledged_at timestamptz;

ALTER TYPE public.investor_event_type ADD VALUE IF NOT EXISTS 'confidentiality_acknowledged';