-- HairlineScan Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  scan_count INTEGER DEFAULT 0 NOT NULL,
  last_scan_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{
    "notifications_enabled": true,
    "dark_mode": true,
    "scan_reminders": true,
    "weekly_reports": true,
    "reminder_frequency": "weekly",
    "measurement_unit": "metric"
  }'::jsonb NOT NULL
);

-- Scans table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  score DECIMAL(4,2) NOT NULL CHECK (score >= 0 AND score <= 10),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  summary TEXT NOT NULL,
  hairline_type TEXT,
  hairline_description TEXT,
  observations TEXT[] DEFAULT '{}',
  likely_patterns TEXT[] DEFAULT '{}',
  personalized_tips TEXT[] DEFAULT '{}',
  photo_front_url TEXT,
  photo_left_url TEXT,
  photo_right_url TEXT,
  questionnaire_data JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{
    "symmetry": 0,
    "definition": 0,
    "fullness": 0,
    "structure": 0,
    "texture": 0
  }'::jsonb,
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Scan comparisons table
CREATE TABLE IF NOT EXISTS public.scan_comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scan_id_1 UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  scan_id_2 UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  comparison_notes TEXT,
  score_difference DECIMAL(4,2) NOT NULL
);

-- Progress reports table
CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly')) NOT NULL,
  average_score DECIMAL(4,2) NOT NULL,
  score_trend TEXT CHECK (score_trend IN ('improving', 'stable', 'declining')) NOT NULL,
  scan_count INTEGER NOT NULL,
  insights TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}'
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT CHECK (requirement_type IN ('scan_count', 'streak', 'score', 'special')) NOT NULL,
  requirement_value INTEGER NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('reminder', 'achievement', 'report', 'tip', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ,
  action_url TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_progress_reports_user_id ON public.progress_reports(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scans policies
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id);

-- Scan comparisons policies
CREATE POLICY "Users can view own comparisons" ON public.scan_comparisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comparisons" ON public.scan_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comparisons" ON public.scan_comparisons
  FOR DELETE USING (auth.uid() = user_id);

-- Progress reports policies
CREATE POLICY "Users can view own reports" ON public.progress_reports
  FOR SELECT USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profile stats after scan
CREATE OR REPLACE FUNCTION public.update_profile_after_scan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    scan_count = scan_count + 1,
    last_scan_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_scan_created ON public.scans;
CREATE TRIGGER on_scan_created
  AFTER INSERT ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_after_scan();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Scan', 'Complete your first hairline scan', 'scan', 'scan_count', 1),
  ('Getting Started', 'Complete 5 scans', 'trending-up', 'scan_count', 5),
  ('Dedicated', 'Complete 10 scans', 'award', 'scan_count', 10),
  ('Hair Expert', 'Complete 25 scans', 'star', 'scan_count', 25),
  ('Scan Master', 'Complete 50 scans', 'crown', 'scan_count', 50),
  ('Perfect Score', 'Achieve a score of 9 or higher', 'trophy', 'score', 9),
  ('Consistent', 'Scan for 7 days in a row', 'flame', 'streak', 7),
  ('Monthly Warrior', 'Scan for 30 days in a row', 'medal', 'streak', 30),
  ('Early Adopter', 'Join during launch period', 'rocket', 'special', 1)
ON CONFLICT (name) DO NOTHING;
