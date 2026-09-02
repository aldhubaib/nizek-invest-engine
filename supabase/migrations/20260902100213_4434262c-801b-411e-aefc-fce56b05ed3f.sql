ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS allocation_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS simulator_used boolean NOT NULL DEFAULT false;

UPDATE public.investors SET allocation_requested = true WHERE allocation_status <> 'none';

UPDATE public.investors i SET simulator_used = true
WHERE EXISTS (
  SELECT 1 FROM public.investor_events e
  WHERE e.investor_id = i.id
    AND e.event_type IN ('simulator_opened','assumption_changed','simulator_snapshot','positions_selected')
);