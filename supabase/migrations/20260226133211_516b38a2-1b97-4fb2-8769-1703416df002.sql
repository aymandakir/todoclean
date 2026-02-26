ALTER TABLE public.profiles
  ADD COLUMN role text,
  ADD COLUMN use_case text,
  ADD COLUMN team_size text,
  ADD COLUMN referral_source text,
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;