-- ============ ENUMS ============
CREATE TYPE public.fund_status AS ENUM ('structuring','open','closed');
CREATE TYPE public.position_code AS ENUM ('A','B','C','D','E','F');
CREATE TYPE public.position_status AS ENUM ('available','reserved','committed');
CREATE TYPE public.engagement_status AS ENUM ('invited','opened','reviewing','interested','inactive');
CREATE TYPE public.allocation_status AS ENUM ('none','requested','under_review','approved','committed','declined');
CREATE TYPE public.device_type AS ENUM ('mobile','tablet','desktop');
CREATE TYPE public.section_key AS ENUM ('hero','why_nizek','founder_pipeline','venture_model','regional_sourcing','equity_model','fund_structure','advantages','investment','simulator','team','request_allocation');
CREATE TYPE public.investor_event_type AS ENUM ('session_start','session_end','section_milestone','positions_selected','simulator_opened','assumption_changed','simulator_snapshot','allocation_requested');
CREATE TYPE public.company_status AS ENUM ('building','active','graduated','exited','closed');
CREATE TYPE public.report_status AS ENUM ('draft','submitted','published');
CREATE TYPE public.app_role AS ENUM ('admin','staff');

-- ============ SHARED TRIGGER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ FUNDS ============
CREATE TABLE public.funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  jurisdiction text NOT NULL DEFAULT '',
  status public.fund_status NOT NULL DEFAULT 'structuring',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.funds TO anon, authenticated;
GRANT ALL ON public.funds TO service_role;
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Funds are publicly readable" ON public.funds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage funds" ON public.funds FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER funds_updated_at BEFORE UPDATE ON public.funds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ INVESTORS ============
CREATE TABLE public.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  company text,
  access_token_hash text NOT NULL UNIQUE,
  token_issued_at timestamptz NOT NULL DEFAULT now(),
  token_revoked_at timestamptz,
  engagement_status public.engagement_status NOT NULL DEFAULT 'invited',
  allocation_status public.allocation_status NOT NULL DEFAULT 'none',
  internal_notes text NOT NULL DEFAULT '',
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  total_visits integer NOT NULL DEFAULT 0,
  total_active_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.investors TO service_role;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage investors" ON public.investors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER investors_updated_at BEFORE UPDATE ON public.investors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FUND POSITIONS ============
CREATE TABLE public.fund_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  position_code public.position_code NOT NULL,
  display_name text NOT NULL,
  ownership_percent numeric(5,2) NOT NULL DEFAULT 5,
  status public.position_status NOT NULL DEFAULT 'available',
  committed_investor_id uuid REFERENCES public.investors(id) ON DELETE SET NULL,
  reserved_at timestamptz,
  committed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fund_id, position_code)
);
GRANT SELECT ON public.fund_positions TO anon, authenticated;
GRANT ALL ON public.fund_positions TO service_role;
ALTER TABLE public.fund_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Position availability is public" ON public.fund_positions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage positions" ON public.fund_positions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER fund_positions_updated_at BEFORE UPDATE ON public.fund_positions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SESSIONS ============
CREATE TABLE public.investor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  active_seconds integer NOT NULL DEFAULT 0,
  device_type public.device_type NOT NULL DEFAULT 'desktop',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX investor_sessions_investor_idx ON public.investor_sessions (investor_id, started_at DESC);
GRANT ALL ON public.investor_sessions TO service_role;
ALTER TABLE public.investor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sessions" ON public.investor_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ SECTION VIEWS ============
CREATE TABLE public.investor_section_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.investor_sessions(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  section_id public.section_key NOT NULL,
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  view_count integer NOT NULL DEFAULT 1,
  active_seconds integer NOT NULL DEFAULT 0,
  max_visible_percent integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, section_id)
);
CREATE INDEX investor_section_views_investor_idx ON public.investor_section_views (investor_id);
GRANT ALL ON public.investor_section_views TO service_role;
ALTER TABLE public.investor_section_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read section views" ON public.investor_section_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER investor_section_views_updated_at BEFORE UPDATE ON public.investor_section_views FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ EVENTS ============
CREATE TABLE public.investor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.investor_sessions(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  event_type public.investor_event_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX investor_events_investor_idx ON public.investor_events (investor_id, occurred_at DESC);
GRANT ALL ON public.investor_events TO service_role;
ALTER TABLE public.investor_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read events" ON public.investor_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ ALLOCATION REQUESTS ============
CREATE TABLE public.allocation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES public.investors(id) ON DELETE SET NULL,
  fund_id uuid NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.investor_sessions(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  company text,
  positions public.position_code[] NOT NULL DEFAULT '{}',
  ownership_percent numeric(5,2) NOT NULL DEFAULT 0,
  quarterly_capital_call numeric(12,2) NOT NULL DEFAULT 0,
  message text,
  status public.allocation_status NOT NULL DEFAULT 'requested',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX allocation_requests_investor_idx ON public.allocation_requests (investor_id, submitted_at DESC);
GRANT ALL ON public.allocation_requests TO service_role;
ALTER TABLE public.allocation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage allocation requests" ON public.allocation_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER allocation_requests_updated_at BEFORE UPDATE ON public.allocation_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PORTFOLIO COMPANIES ============
CREATE TABLE public.portfolio_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  name text NOT NULL,
  status public.company_status NOT NULL DEFAULT 'building',
  country text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.portfolio_companies TO service_role;
ALTER TABLE public.portfolio_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage portfolio companies" ON public.portfolio_companies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER portfolio_companies_updated_at BEFORE UPDATE ON public.portfolio_companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ QUARTERLY REPORTS ============
CREATE TABLE public.quarterly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_company_id uuid NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  report_quarter integer NOT NULL CHECK (report_quarter BETWEEN 1 AND 4),
  period_start date,
  period_end date,
  submitted_at timestamptz,
  status public.report_status NOT NULL DEFAULT 'draft',
  revenue numeric(14,2),
  expenses numeric(14,2),
  net_profit_loss numeric(14,2),
  cash_balance numeric(14,2),
  runway_months numeric(5,1),
  summary text NOT NULL DEFAULT '',
  document_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (portfolio_company_id, report_year, report_quarter)
);
GRANT ALL ON public.quarterly_reports TO service_role;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quarterly reports" ON public.quarterly_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER quarterly_reports_updated_at BEFORE UPDATE ON public.quarterly_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SEED: FUND A + SIX POSITIONS ============
INSERT INTO public.funds (name, code, jurisdiction, status)
VALUES ('Nizek Venture Studio Fund A', 'Fund A', 'Abu Dhabi, UAE', 'open');

INSERT INTO public.fund_positions (fund_id, position_code, display_name, ownership_percent, status, committed_at)
SELECT f.id, c.code::public.position_code, 'Investor ' || c.code, 5,
       CASE WHEN c.code IN ('A','B') THEN 'committed'::public.position_status ELSE 'available'::public.position_status END,
       CASE WHEN c.code IN ('A','B') THEN now() ELSE NULL END
FROM public.funds f
CROSS JOIN (VALUES ('A'),('B'),('C'),('D'),('E'),('F')) AS c(code)
WHERE f.code = 'Fund A';