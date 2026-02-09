-- Supabase Schema for AI Personal Stylist MVP
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table: stores wardrobe items with AI-generated descriptions
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Item',
  image_urls JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  ai_description JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outfits table: stores AI-suggested outfits
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  situation TEXT NOT NULL,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  styling_reason TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add cover_image_url column if table already exists
-- ALTER TABLE outfits ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS outfits_user_id_idx ON outfits(user_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for outfits
CREATE POLICY "Users can view own outfits"
  ON outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Migration: Add name column if table already exists
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled Item';

-- Storage bucket for garment images
-- Note: Run this in the Supabase Dashboard > Storage > Create new bucket
-- Bucket name: garments
-- Public: false

-- Storage RLS Policy (run after creating the bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('garments', 'garments', false);

-- CREATE POLICY "Users can upload to own folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'garments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'garments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'garments' AND auth.uid()::text = (storage.foldername(name))[1]);
