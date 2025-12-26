/*
  # BizGenius Initial Schema

  This migration creates all initial tables for the BizGenius application.

  1. New Tables
    - `users` - User accounts with subscription info
      - `id` (serial, primary key)
      - `email` (text, unique) - User email
      - `hashed_password` (text) - Bcrypt hashed password
      - `full_name` (text, nullable) - Display name
      - `is_active` (boolean, default true) - Account status
      - `is_verified` (boolean, default false) - Email verification
      - `subscription_tier` (text, default 'free') - Current plan
      - `stripe_customer_id` (text, nullable) - Stripe customer
      - `stripe_subscription_id` (text, nullable) - Stripe subscription
      - `subscription_status` (text, default 'inactive') - Subscription state
      - `created_at`, `updated_at` (timestamptz)

    - `ideas` - Business ideas with AI-generated content
      - `id` (serial, primary key)
      - `title` (text) - Idea title
      - `description` (text) - Idea description
      - `industry` (text, nullable) - Industry category
      - `target_market` (text, nullable) - Target audience
      - `user_id` (integer, FK to users) - Owner
      - `business_plan`, `financial_model`, `market_research`, 
        `competitor_analysis`, `pitch_deck` (jsonb, nullable) - AI content
      - `generated_at` (timestamptz, nullable)
      - `created_at`, `updated_at` (timestamptz)

    - `subscription_plans` - Available subscription tiers
      - `id` (serial, primary key)
      - `name` (text) - Plan name
      - `description` (text, nullable)
      - `price_monthly`, `price_yearly` (float, nullable)
      - `stripe_price_id` (text, nullable)
      - `features` (jsonb, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

    - `payments` - Payment transaction records
      - `id` (serial, primary key)
      - `user_id` (integer, FK to users)
      - `amount` (float)
      - `currency` (text, default 'usd')
      - `stripe_payment_intent_id`, `stripe_invoice_id` (text, nullable)
      - `status` (text, default 'pending')
      - `description` (text, nullable)
      - `created_at` (timestamptz)

  2. Indexes
    - `users`: id, email (unique), stripe_customer_id
    - `ideas`: id, user_id
    - `subscription_plans`: id
    - `payments`: id, user_id

  3. Notes
    - This app uses custom JWT authentication (not Supabase Auth)
    - Backend handles all authentication/authorization via API
    - Tables are accessed via backend API, not directly from client
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_stripe_customer_id ON users(stripe_customer_id);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  industry VARCHAR(100),
  target_market VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  business_plan JSONB,
  financial_model JSONB,
  market_research JSONB,
  competitor_analysis JSONB,
  pitch_deck JSONB,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_ideas_id ON ideas(id);
CREATE INDEX IF NOT EXISTS ix_ideas_user_id ON ideas(user_id);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly FLOAT,
  price_yearly FLOAT,
  stripe_price_id VARCHAR(255),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_subscription_plans_id ON subscription_plans(id);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_payments_id ON payments(id);
CREATE INDEX IF NOT EXISTS ix_payments_user_id ON payments(user_id);