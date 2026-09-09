CREATE TYPE public.interest_level AS ENUM ('unset','yes','no','maybe');
ALTER TABLE public.investors ADD COLUMN interest interest_level NOT NULL DEFAULT 'unset';