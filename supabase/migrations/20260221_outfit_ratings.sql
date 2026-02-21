-- Migration: Create outfit_ratings table for the feedback loop
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS outfit_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_items JSONB NOT NULL DEFAULT '[]',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast preference lookups
CREATE INDEX IF NOT EXISTS outfit_ratings_user_id_idx ON outfit_ratings(user_id);

-- Enable Row Level Security
ALTER TABLE outfit_ratings ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only view their own ratings
CREATE POLICY "Users can view own ratings"
  ON outfit_ratings FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Users can only insert their own ratings
CREATE POLICY "Users can insert own ratings"
  ON outfit_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
