CREATE TABLE public.franchise_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  region text NOT NULL CHECK (char_length(region) BETWEEN 1 AND 100),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  privacy_consent boolean NOT NULL CHECK (privacy_consent = true),
  status text NOT NULL DEFAULT '접수',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.franchise_consultations TO anon, authenticated;
GRANT ALL ON public.franchise_consultations TO service_role;
ALTER TABLE public.franchise_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit consultation" ON public.franchise_consultations
  FOR INSERT TO anon, authenticated WITH CHECK (privacy_consent = true AND status = '접수');