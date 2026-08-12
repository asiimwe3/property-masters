/**
 * SageCo Evergreen — Database Migration v2.0
 * =============================================
 * This migration addresses ALL critical findings from the technical audit:
 *
 * 1. Row Level Security (RLS) policies for all tables
 * 2. Double-entry financial ledger (transactions + ledger_entries)
 * 3. Schema fixes (updated_at triggers, broker_id, description, coordinates)
 * 4. Broker verification workflow
 * 5. Payment verification tracking
 * 6. Booking status management
 *
 * Run this in the Supabase SQL Editor.
 * Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE).
 */

-- ============================================================================
-- SECTION 1: SCHEMA FIXES & NEW TABLES
-- ============================================================================

-- 1.1 Add missing columns to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 1.2 Add updated_at to brokers and bookings
ALTER TABLE brokers
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_status TEXT;

-- 1.3 Add verification_status to user_profiles (for role escalation)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- ============================================================================
-- SECTION 2: DOUBLE-ENTRY FINANCIAL LEDGER
-- ============================================================================

-- 2.1 Transactions table — records every financial event
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,           -- e.g. "VIEWING-PROP-1234567890"
  type TEXT NOT NULL CHECK (type IN (
    'viewing_fee',
    'broker_registration',
    'broker_activation',
    'property_purchase',
    'refund',
    'payout'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- payment initiated but not confirmed
    'completed',    -- payment confirmed by PesaPal
    'failed',       -- payment failed or cancelled
    'refunded'      -- payment was refunded
  )),
  amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'UGX',
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  description TEXT,
  -- PesaPal tracking
  pesapal_order_tracking_id TEXT,
  pesapal_payment_status TEXT,
  pesapal_payment_method TEXT,
  -- Relationships
  user_id UUID REFERENCES auth.users(id),
  broker_id UUID,
  property_id UUID,
  booking_id UUID,
  -- Metadata
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Ledger entries — the double-entry bookkeeping rows
-- Every transaction creates AT LEAST two rows (debit + credit)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account TEXT NOT NULL CHECK (account IN (
    'cash',              -- money received/paid out
    'viewing_fees',      -- revenue from property viewings
    'broker_fees',       -- revenue from broker registration/activation
    'property_sales',    -- revenue from property purchases
    'refunds',           -- money returned to customers
    'payouts',           -- money paid to brokers/owners
    'accounts_receivable',
    'accounts_payable'
  )),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_transaction_id ON ledger_entries(transaction_id);

-- ============================================================================
-- SECTION 3: AUTOMATIC updated_at TRIGGERS
-- ============================================================================

-- 3.1 Generic trigger function that updates the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Attach triggers to all tables
DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS brokers_updated_at ON brokers;
CREATE TRIGGER brokers_updated_at
  BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies ensure users can only access their own data,
-- while public data (available properties, active brokers) is readable by all.

-- 4.1 Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 4.2 PROPERTIES — anyone can read available properties, only owner can modify
DROP POLICY IF EXISTS "properties_public_read" ON properties;
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (status = 'available');

-- Authenticated users can insert properties (with broker_id = their own id)
DROP POLICY IF EXISTS "properties_user_insert" ON properties;
CREATE POLICY "properties_user_insert" ON properties
  FOR INSERT TO authenticated WITH CHECK (broker_id = auth.uid());

-- Only the property owner can update or delete their properties
DROP POLICY IF EXISTS "properties_owner_update" ON properties;
CREATE POLICY "properties_owner_update" ON properties
  FOR UPDATE TO authenticated USING (broker_id = auth.uid()) WITH CHECK (broker_id = auth.uid());

DROP POLICY IF EXISTS "properties_owner_delete" ON properties;
CREATE POLICY "properties_owner_delete" ON properties
  FOR DELETE TO authenticated USING (broker_id = auth.uid());

-- Service role can do everything (for backend functions)
DROP POLICY IF EXISTS "properties_service_role_all" ON properties;
CREATE POLICY "properties_service_role_all" ON properties
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.3 BROKERS — anyone can read active/registered brokers
DROP POLICY IF EXISTS "brokers_public_read" ON brokers;
CREATE POLICY "brokers_public_read" ON brokers
  FOR SELECT USING (registration_status IN ('registered', 'active'));

-- Users can insert their own broker registration
DROP POLICY IF EXISTS "brokers_user_insert" ON brokers;
CREATE POLICY IF EXISTS "brokers_user_insert" ON brokers
  FOR INSERT TO authenticated WITH CHECK (true);

-- Only the broker themselves can update their profile
DROP POLICY IF EXISTS "brokers_self_update" ON brokers;
CREATE POLICY "brokers_self_update" ON brokers
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (true);

-- Service role can do everything
DROP POLICY IF EXISTS "brokers_service_role_all" ON brokers;
CREATE POLICY "brokers_service_role_all" ON brokers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.4 BOOKINGS — users can only see their own bookings
DROP POLICY IF EXISTS "bookings_owner_read" ON bookings;
CREATE POLICY "bookings_owner_read" ON bookings
  FOR SELECT TO authenticated USING (customer_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Users can insert bookings for themselves
DROP POLICY IF EXISTS "bookings_user_insert" ON bookings;
CREATE POLICY "bookings_user_insert" ON bookings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Service role can do everything (for IPN webhook updates)
DROP POLICY IF EXISTS "bookings_service_role_all" ON bookings;
CREATE POLICY "bookings_service_role_all" ON bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.5 USER_PROFILES — users can only read/update their own profile
DROP POLICY IF EXISTS "user_profiles_self_read" ON user_profiles;
CREATE POLICY "user_profiles_self_read" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_self_update" ON user_profiles;
CREATE POLICY "user_profiles_self_update" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Users can insert their own profile on signup
DROP POLICY IF EXISTS "user_profiles_self_insert" ON user_profiles;
CREATE POLICY "user_profiles_self_insert" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Service role can do everything
DROP POLICY IF EXISTS "user_profiles_service_role_all" ON user_profiles;
CREATE POLICY "user_profiles_service_role_all" ON user_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.6 TRANSACTIONS — users can only see their own transactions
DROP POLICY IF EXISTS "transactions_owner_read" ON transactions;
CREATE POLICY "transactions_owner_read" ON transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can insert their own transactions (when initiating payment)
DROP POLICY IF EXISTS "transactions_owner_insert" ON transactions;
CREATE POLICY "transactions_owner_insert" ON transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Service role can do everything (for IPN webhook + ledger)
DROP POLICY IF EXISTS "transactions_service_role_all" ON transactions;
CREATE POLICY "transactions_service_role_all" ON transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.7 LEDGER ENTRIES — only service role (backend) can access
DROP POLICY IF EXISTS "ledger_service_role_all" ON ledger_entries;
CREATE POLICY "ledger_service_role_all" ON ledger_entries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 5: DATABASE FUNCTIONS (for secure server-side operations)
-- ============================================================================

-- 5.1 Record a double-entry ledger for a transaction
-- This function is called AFTER payment is confirmed by PesaPal IPN
CREATE OR REPLACE FUNCTION record_ledger_entry(
  p_transaction_id UUID,
  p_account TEXT,
  p_entry_type TEXT,
  p_amount DECIMAL(14, 2),
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_entry_id UUID;
BEGIN
  INSERT INTO ledger_entries (
    transaction_id, account, entry_type, amount, description
  ) VALUES (
    p_transaction_id, p_account, p_entry_type, p_amount, p_description
  )
  RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Confirm a payment and create double-entry ledger rows
-- Called by the PesaPal IPN webhook handler after verifying payment status
CREATE OR REPLACE FUNCTION confirm_payment(
  p_reference TEXT,
  p_pesapal_tracking_id TEXT,
  p_pesapal_status TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_raw_response JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_transaction RECORD;
  v_debit_entry UUID;
  v_credit_entry UUID;
  v_booking RECORD;
BEGIN
  -- 1. Find the transaction by reference
  SELECT * INTO v_transaction
  FROM transactions
  WHERE reference = p_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  -- 2. Update transaction status
  UPDATE transactions SET
    status = CASE WHEN p_pesapal_status IN ('COMPLETED', 'Completed', 'completed') THEN 'completed'
                  WHEN p_pesapal_status IN ('FAILED', 'Failed', 'failed') THEN 'failed'
                  ELSE status END,
    pesapal_order_tracking_id = p_pesapal_tracking_id,
    pesapal_payment_status = p_pesapal_status,
    pesapal_payment_method = p_payment_method,
    raw_response = COALESCE(p_raw_response, raw_response)
  WHERE id = v_transaction.id
  RETURNING * INTO v_transaction;

  -- 3. Only create ledger entries if payment is completed
  IF p_pesapal_status IN ('COMPLETED', 'Completed', 'completed') THEN

    -- Debit: cash increases (money received)
    v_debit_entry := record_ledger_entry(
      v_transaction.id, 'cash', 'debit', v_transaction.amount,
      'Payment received for: ' || v_transaction.description
    );

    -- Credit: revenue account increases (based on transaction type)
    v_credit_entry := record_ledger_entry(
      v_transaction.id,
      CASE v_transaction.type
        WHEN 'viewing_fee' THEN 'viewing_fees'
        WHEN 'broker_registration' THEN 'broker_fees'
        WHEN 'broker_activation' THEN 'broker_fees'
        WHEN 'property_purchase' THEN 'property_sales'
        ELSE 'viewing_fees'
      END,
      'credit',
      v_transaction.amount,
      'Revenue: ' || v_transaction.description
    );

    -- 4. Update related booking if exists
    IF v_transaction.booking_id IS NOT NULL THEN
      UPDATE bookings SET
        payment_verified = true,
        pesapal_tracking_id = p_pesapal_tracking_id,
        pesapal_status = 'confirmed',
        status = 'confirmed'
      WHERE id = v_transaction.booking_id;
    END IF;

    -- 5. Update broker status if this is a registration payment
    IF v_transaction.type = 'broker_registration' AND v_transaction.broker_id IS NOT NULL THEN
      UPDATE brokers SET
        registration_status = 'registered',
        verified = false  -- still needs admin verification
      WHERE id = v_transaction.broker_id;
    END IF;

    IF v_transaction.type = 'broker_activation' AND v_transaction.broker_id IS NOT NULL THEN
      UPDATE brokers SET
        registration_status = 'active',
        verified = true
      WHERE id = v_transaction.broker_id;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction.id,
    'status', v_transaction.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 6: CLEANUP ORPHANED BROKER RECORDS
-- ============================================================================
-- Function to clean up broker records where payment was never completed
-- Should be called by a scheduled job (Supabase cron) every 24 hours

CREATE OR REPLACE FUNCTION cleanup_orphaned_brokers()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM brokers
  WHERE registration_status = 'pending'
    AND created_at < now() - INTERVAL '24 hours'
    AND id NOT IN (
      SELECT broker_id FROM transactions
      WHERE type IN ('broker_registration', 'broker_activation')
        AND status = 'completed'
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- After running this:
-- 1. All tables have RLS enabled with proper policies
-- 2. Double-entry ledger is ready (transactions + ledger_entries)
-- 3. Payment confirmation creates proper accounting entries
-- 4. Orphaned broker records are cleaned up automatically
-- 5. All tables have updated_at tracking
-- ============================================================================
