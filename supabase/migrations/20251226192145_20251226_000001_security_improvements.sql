/*
  # Security Improvements

  1. Index Optimization
    - Remove redundant indexes on primary key columns (PKs already have indexes)
    - Keep foreign key indexes for query performance
    - Keep stripe_customer_id index for payment lookups

  2. Row Level Security (RLS)
    - Enable RLS on all tables
    - Create restrictive policies since this app uses custom JWT auth via backend
    - Backend uses service role connection, so RLS is defense-in-depth
    - Policies deny all direct access (all access should go through backend API)

  3. Notes
    - This application uses custom authentication via FastAPI backend
    - Client never directly accesses Supabase (all access via backend API)
    - RLS provides defense-in-depth protection
    - Backend connection bypasses RLS using service role credentials
*/

-- Remove redundant indexes on primary keys (PKs already have built-in indexes)
DROP INDEX IF EXISTS ix_users_id;
DROP INDEX IF EXISTS ix_ideas_id;
DROP INDEX IF EXISTS ix_subscription_plans_id;
DROP INDEX IF EXISTS ix_payments_id;

-- Keep these indexes as they're useful:
-- ix_users_email (unique lookups)
-- ix_users_stripe_customer_id (Stripe lookups)
-- ix_ideas_user_id (foreign key queries)
-- ix_payments_user_id (foreign key queries)

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies (deny all direct access)
-- Since this app uses custom authentication via backend API,
-- these policies ensure no direct database access from clients

-- Users table: Deny all direct access
CREATE POLICY "Deny all direct access to users"
  ON users
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Ideas table: Deny all direct access
CREATE POLICY "Deny all direct access to ideas"
  ON ideas
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Subscription plans table: Deny all direct access
CREATE POLICY "Deny all direct access to subscription_plans"
  ON subscription_plans
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Payments table: Deny all direct access
CREATE POLICY "Deny all direct access to payments"
  ON payments
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);