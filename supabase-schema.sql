-- Supabase Database Schema for In Laws Math
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  solved_problems INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  last_activity DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for leaderboard queries
CREATE INDEX idx_users_points ON public.users(points DESC);
CREATE INDEX idx_users_streak ON public.users(streak DESC);

-- ============================================
-- PROBLEMS TABLE
-- ============================================
CREATE TYPE difficulty_type AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE public.problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  solution TEXT NOT NULL,
  hints TEXT[] DEFAULT '{}',
  difficulty difficulty_type NOT NULL DEFAULT 'easy',
  tags TEXT[] DEFAULT '{}',
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for filtering
CREATE INDEX idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX idx_problems_tags ON public.problems USING GIN(tags);

-- ============================================
-- USER PROBLEMS (tracking attempts/solutions)
-- ============================================
CREATE TABLE public.user_problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  solved BOOLEAN DEFAULT FALSE,
  solved_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  UNIQUE(user_id, problem_id)
);

-- Index for user progress
CREATE INDEX idx_user_problems_user ON public.user_problems(user_id);
CREATE INDEX idx_user_problems_problem ON public.user_problems(problem_id);
CREATE INDEX idx_user_problems_solved ON public.user_problems(user_id, solved);

-- ============================================
-- MESSAGES TABLE (for chat)
-- ============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_read BOOLEAN DEFAULT FALSE
);

-- Index for chat queries
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all users (for leaderboard), update only their own
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Problems: Everyone can read, only authenticated users can modify
CREATE POLICY "Everyone can read problems" ON public.problems
  FOR SELECT USING (true);

-- User Problems: Users can only see/manage their own
CREATE POLICY "Users can read own problem progress" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problem progress" ON public.user_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problem progress" ON public.user_problems
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Users can read messages where they are sender or receiver
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, image)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'image'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = NEW.raw_user_meta_data->>'name',
    image = NEW.raw_user_meta_data->>'image';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats when problem is solved
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.solved = TRUE AND (OLD.solved = FALSE OR OLD.solved IS NULL) THEN
    -- Get problem points
    DECLARE
      problem_points INTEGER;
    BEGIN
      SELECT points INTO problem_points FROM public.problems WHERE id = NEW.problem_id;
      
      -- Update user stats
      UPDATE public.users 
      SET 
        solved_problems = solved_problems + 1,
        points = points + COALESCE(problem_points, 0),
        streak = CASE 
          WHEN last_activity = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
          WHEN last_activity < CURRENT_DATE - INTERVAL '1 day' THEN 1
          ELSE streak
        END,
        last_activity = CURRENT_DATE
      WHERE id = NEW.user_id;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on problem solve
CREATE TRIGGER on_problem_solved
  AFTER INSERT OR UPDATE ON public.user_problems
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- ============================================
-- SEED DATA (Optional - Sample Problems)
-- ============================================

-- Insert sample problems
INSERT INTO public.problems (question, solution, hints, difficulty, tags, points) VALUES
(
  'What is the sum of all integers from 1 to 100?',
  'The sum of integers from 1 to n is given by the formula: $\\frac{n(n+1)}{2}$.\n\nFor n = 100: $\\frac{100 \\times 101}{2} = 5050$',
  ARRAY['Think about pairing numbers from opposite ends', '1 + 100 = 101, 2 + 99 = 101, etc.'],
  'easy',
  ARRAY['arithmetic', 'summation'],
  10
),
(
  'Prove that the square root of 2 is irrational.',
  'Proof by contradiction:\n\n1. Assume $\\sqrt{2}$ is rational, so $\\sqrt{2} = \\frac{p}{q}$ where p, q are coprime integers.\n\n2. Squaring: $2 = \\frac{p^2}{q^2}$, so $p^2 = 2q^2$\n\n3. This means $p^2$ is even, so p is even. Let p = 2k.\n\n4. Substituting: $(2k)^2 = 2q^2$, so $4k^2 = 2q^2$, thus $q^2 = 2k^2$\n\n5. This means q is also even, contradicting that p and q are coprime.\n\nTherefore, $\\sqrt{2}$ is irrational.',
  ARRAY['Use proof by contradiction', 'Assume it can be written as a fraction in lowest terms'],
  'medium',
  ARRAY['proof', 'number theory', 'irrationality'],
  20
),
(
  'Find all real solutions to: $x^4 - 5x^2 + 4 = 0$',
  'Let $u = x^2$. Then the equation becomes:\n\n$u^2 - 5u + 4 = 0$\n\nFactoring: $(u-1)(u-4) = 0$\n\nSo $u = 1$ or $u = 4$\n\nSince $u = x^2$:\n- $x^2 = 1 \\Rightarrow x = \\pm 1$\n- $x^2 = 4 \\Rightarrow x = \\pm 2$\n\nSolutions: $x \\in \\{-2, -1, 1, 2\\}$',
  ARRAY['Use substitution to reduce to a quadratic', 'Let u = x²'],
  'medium',
  ARRAY['algebra', 'polynomials', 'substitution'],
  20
),
(
  'Evaluate the integral: $\\int_0^{\\pi} \\sin^2(x) dx$',
  'Use the identity: $\\sin^2(x) = \\frac{1 - \\cos(2x)}{2}$\n\n$\\int_0^{\\pi} \\sin^2(x) dx = \\int_0^{\\pi} \\frac{1 - \\cos(2x)}{2} dx$\n\n$= \\frac{1}{2} \\int_0^{\\pi} 1 dx - \\frac{1}{2} \\int_0^{\\pi} \\cos(2x) dx$\n\n$= \\frac{1}{2}[x]_0^{\\pi} - \\frac{1}{4}[\\sin(2x)]_0^{\\pi}$\n\n$= \\frac{\\pi}{2} - 0 = \\frac{\\pi}{2}$',
  ARRAY['Use the power-reduction identity', '$\\sin^2(x) = \\frac{1 - \\cos(2x)}{2}$'],
  'hard',
  ARRAY['calculus', 'integration', 'trigonometry'],
  50
),
(
  'A fair coin is flipped 3 times. What is the probability of getting exactly 2 heads?',
  'Total outcomes: $2^3 = 8$\n\nFavorable outcomes (exactly 2 heads): HHT, HTH, THH = 3 outcomes\n\nProbability: $\\frac{3}{8}$\n\nAlternatively, using binomial probability:\n$P(X=2) = \\binom{3}{2} \\left(\\frac{1}{2}\\right)^2 \\left(\\frac{1}{2}\\right)^1 = 3 \\cdot \\frac{1}{8} = \\frac{3}{8}$',
  ARRAY['Count the total number of possible outcomes', 'List all outcomes with exactly 2 heads'],
  'easy',
  ARRAY['probability', 'combinatorics'],
  10
);
