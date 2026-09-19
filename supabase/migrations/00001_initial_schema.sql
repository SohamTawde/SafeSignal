-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'authority', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Handle automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'authority');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Safety Signals Table
CREATE TABLE safety_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grid_zone TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('catcalling', 'following', 'verbal_harassment', 'threatening_behavior', 'suspicious_behavior', 'other')),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'aggregated', 'reviewed', 'dismissed')),
    trust_score NUMERIC DEFAULT 0,
    reporter_diversity NUMERIC DEFAULT 0,
    time_spread NUMERIC DEFAULT 0,
    category_diversity NUMERIC DEFAULT 0,
    burst_penalty NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Safety Patterns Table
CREATE TABLE safety_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grid_zone TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    report_count INTEGER DEFAULT 1,
    categories JSONB DEFAULT '[]'::jsonb,
    trust_score NUMERIC DEFAULT 0,
    priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'emerging' CHECK (status IN ('emerging', 'under_review', 'validated', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id UUID REFERENCES safety_patterns(id) ON DELETE CASCADE,
    authority_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('review', 'validate', 'dismiss')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Safety Zones Table
CREATE TABLE safety_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_name TEXT,
    grid_zone TEXT UNIQUE NOT NULL,
    center_lat NUMERIC NOT NULL,
    center_lng NUMERIC NOT NULL,
    activity_level TEXT DEFAULT 'low' CHECK (activity_level IN ('low', 'emerging', 'under_review', 'high_priority')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) --

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Safety Signals RLS
-- Anonymous users can insert
CREATE POLICY "Anyone can insert safety signals" ON safety_signals
    FOR INSERT TO public WITH CHECK (true);
-- Authenticated users (authorities) can select and update
CREATE POLICY "Authorities can view safety signals" ON safety_signals
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can update safety signals" ON safety_signals
    FOR UPDATE TO authenticated USING (true);

-- Safety Patterns RLS
CREATE POLICY "Authorities can view safety patterns" ON safety_patterns
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can insert safety patterns" ON safety_patterns
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authorities can update safety patterns" ON safety_patterns
    FOR UPDATE TO authenticated USING (true);
-- Optionally, allow public to view patterns for the public map
CREATE POLICY "Public can view safety patterns" ON safety_patterns
    FOR SELECT TO public USING (true);
-- Let public insert/update patterns because the frontend pattern engine is run by the client submitting (for MVP)
CREATE POLICY "Public can insert safety patterns" ON safety_patterns
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update safety patterns" ON safety_patterns
    FOR UPDATE TO public USING (true);

-- Reviews RLS
CREATE POLICY "Authorities can view reviews" ON reviews
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can insert reviews" ON reviews
    FOR INSERT TO authenticated WITH CHECK (true);

-- Safety Zones RLS
-- Anyone can view safety zones for the public map
CREATE POLICY "Public can view safety zones" ON safety_zones
    FOR SELECT TO public USING (true);
-- Anyone can update zones (because pattern engine MVP runs client-side on report)
CREATE POLICY "Public can update safety zones" ON safety_zones
    FOR UPDATE TO public USING (true);
CREATE POLICY "Public can insert safety zones" ON safety_zones
    FOR INSERT TO public WITH CHECK (true);

-- Enable Realtime for tables
alter publication supabase_realtime add table safety_signals;
alter publication supabase_realtime add table safety_patterns;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table safety_zones;
