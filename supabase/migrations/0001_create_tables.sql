-- Create all tables for Quinoapp
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  specialist_id varchar,
  target_calories integer DEFAULT 2000,
  created_at timestamp NOT NULL DEFAULT now()
);

-- 2. Meals table
CREATE TABLE IF NOT EXISTS meals (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  meal_type text NOT NULL,
  calories integer NOT NULL,
  protein decimal(5, 1) NOT NULL,
  carbs decimal(5, 1) NOT NULL,
  fats decimal(5, 1) NOT NULL,
  serving_size text,
  image_url text,
  created_at timestamp NOT NULL DEFAULT now()
);

-- 3. Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  instructions jsonb NOT NULL,
  calories integer NOT NULL,
  protein decimal(5, 1) NOT NULL,
  carbs decimal(5, 1) NOT NULL,
  fats decimal(5, 1) NOT NULL,
  serving_size text,
  image_url text,
  meal_type text,
  created_by varchar,
  created_at timestamp NOT NULL DEFAULT now()
);

-- 4. Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  name text NOT NULL,
  start_date timestamp NOT NULL,
  end_date timestamp,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

-- 5. Schedule entries table
CREATE TABLE IF NOT EXISTS schedule_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id varchar NOT NULL,
  meal_id varchar NOT NULL,
  meal_type text NOT NULL,
  day_of_week integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

-- 6. Compliance logs table
CREATE TABLE IF NOT EXISTS compliance_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  meal_id varchar NOT NULL,
  meal_type text NOT NULL,
  scheduled_date timestamp NOT NULL,
  completed_at timestamp,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);
