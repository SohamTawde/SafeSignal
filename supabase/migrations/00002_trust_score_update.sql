-- Add anonymous reporter hash to safety_signals
ALTER TABLE safety_signals ADD COLUMN IF NOT EXISTS anonymous_reporter_hash TEXT;

-- Add detailed trust score metrics to safety_patterns
ALTER TABLE safety_patterns ADD COLUMN IF NOT EXISTS reporter_diversity NUMERIC DEFAULT 0;
ALTER TABLE safety_patterns ADD COLUMN IF NOT EXISTS time_spread NUMERIC DEFAULT 0;
ALTER TABLE safety_patterns ADD COLUMN IF NOT EXISTS category_diversity NUMERIC DEFAULT 0;
ALTER TABLE safety_patterns ADD COLUMN IF NOT EXISTS burst_penalty NUMERIC DEFAULT 0;
