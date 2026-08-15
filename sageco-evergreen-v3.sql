-- =============================================================================
-- Migration File: sageco-evergreen-v3.sql
-- Application:    SAGECO Evergreen (PropTech Platform in Uganda)
-- Platform:       PostgreSQL / Supabase Database Schema v3
--
-- Description:
--   This migration introduces 10 advanced feature areas to support spatial
--   drone surveys, AI broker agent communication, programmable escrow payments,
--   predictive land valuations & arable analytics, fractional eco-land tokenization,
--   digital land passports, AI land fraud detection, smart property matching,
--   remote site-visit technology, and eco-land investment intelligence.
--
-- Safety & Idempotency:
--   - Uses IF NOT EXISTS / CREATE OR REPLACE statements throughout.
--   - UUID Primary Keys generated with gen_random_uuid().
--   - Timestamps (created_at, updated_at) default to NOW().
--   - Includes automatic updated_at triggers for all mutable tables.
--   - Row Level Security (RLS) enabled for all tables with access control policies
--     for Owners, Brokers, and Admins.
--   - Performance indexes created for primary keys, foreign keys, status fields,
--     and JSONB attributes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONS & HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shared trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------------------------------
-- BASE TABLE STUBS (Safeguard for fresh environment setup)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    views INTEGER DEFAULT 0,
    owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    payment_verified BOOLEAN DEFAULT FALSE,
    pesapal_tracking_id TEXT,
    pesapal_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- FEATURE 1: AI-Driven Drone & Spatial Verification
-- =============================================================================

CREATE TABLE IF NOT EXISTS drone_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('drone_mapping', 'lidar_scan', '3d_twin', 'gps_verification', 'remote_inspection', 'anti_fraud')),
    survey_date TIMESTAMPTZ DEFAULT NOW(),
    drone_operator_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    orthophoto_url TEXT,
    dem_url TEXT,
    point_cloud_url TEXT,
    "3d_model_url" TEXT,
    boundary_geojson JSONB,
    area_sqm NUMERIC(15, 2),
    accuracy_level VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 1
CREATE INDEX IF NOT EXISTS idx_drone_surveys_property_id ON drone_surveys(property_id);
CREATE INDEX IF NOT EXISTS idx_drone_surveys_drone_operator_id ON drone_surveys(drone_operator_id);
CREATE INDEX IF NOT EXISTS idx_drone_surveys_verification_status ON drone_surveys(verification_status);
CREATE INDEX IF NOT EXISTS idx_drone_surveys_boundary_geojson ON drone_surveys USING GIN (boundary_geojson);

-- Trigger for Feature 1
DROP TRIGGER IF EXISTS trg_drone_surveys_updated_at ON drone_surveys;
CREATE TRIGGER trg_drone_surveys_updated_at
    BEFORE UPDATE ON drone_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 1
ALTER TABLE drone_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS drone_surveys_select_policy ON drone_surveys;
CREATE POLICY drone_surveys_select_policy ON drone_surveys
    FOR SELECT USING (
        auth.uid() = drone_operator_id OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = drone_surveys.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        ) OR
        verification_status = 'verified'
    );

DROP POLICY IF EXISTS drone_surveys_insert_policy ON drone_surveys;
CREATE POLICY drone_surveys_insert_policy ON drone_surveys
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS drone_surveys_update_policy ON drone_surveys;
CREATE POLICY drone_surveys_update_policy ON drone_surveys
    FOR UPDATE USING (
        auth.uid() = drone_operator_id OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = drone_surveys.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS drone_surveys_delete_policy ON drone_surveys;
CREATE POLICY drone_surveys_delete_policy ON drone_surveys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 2: Agentic WhatsApp & Web Broker
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone VARCHAR(50),
    user_name TEXT,
    conversation_type VARCHAR(50) DEFAULT 'whatsapp' CHECK (conversation_type IN ('whatsapp', 'web')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived', 'escalated')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    property_matches JSONB,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('search', 'match', 'followup', 'schedule')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    payload JSONB,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 2
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_phone ON ai_conversations(user_phone);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(conversation_type);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_property_matches ON ai_messages USING GIN (property_matches);

CREATE INDEX IF NOT EXISTS idx_broker_tasks_conversation_id ON broker_tasks(conversation_id);
CREATE INDEX IF NOT EXISTS idx_broker_tasks_broker_id ON broker_tasks(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_tasks_status ON broker_tasks(status);
CREATE INDEX IF NOT EXISTS idx_broker_tasks_task_type ON broker_tasks(task_type);

-- Triggers for Feature 2
DROP TRIGGER IF EXISTS trg_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER trg_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_messages_updated_at ON ai_messages;
CREATE TRIGGER trg_ai_messages_updated_at
    BEFORE UPDATE ON ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_broker_tasks_updated_at ON broker_tasks;
CREATE TRIGGER trg_broker_tasks_updated_at
    BEFORE UPDATE ON broker_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 2
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for ai_conversations
DROP POLICY IF EXISTS ai_conversations_select_policy ON ai_conversations;
CREATE POLICY ai_conversations_select_policy ON ai_conversations
    FOR SELECT USING (
        auth.uid() IS NOT NULL OR user_phone IS NOT NULL
    );

DROP POLICY IF EXISTS ai_conversations_all_policy ON ai_conversations;
CREATE POLICY ai_conversations_all_policy ON ai_conversations
    FOR ALL USING (true);

-- Policies for ai_messages
DROP POLICY IF EXISTS ai_messages_select_policy ON ai_messages;
CREATE POLICY ai_messages_select_policy ON ai_messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS ai_messages_all_policy ON ai_messages;
CREATE POLICY ai_messages_all_policy ON ai_messages
    FOR ALL USING (true);

-- Policies for broker_tasks
DROP POLICY IF EXISTS broker_tasks_select_policy ON broker_tasks;
CREATE POLICY broker_tasks_select_policy ON broker_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brokers b
            WHERE b.id = broker_tasks.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS broker_tasks_update_policy ON broker_tasks;
CREATE POLICY broker_tasks_update_policy ON broker_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM brokers b
            WHERE b.id = broker_tasks.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS broker_tasks_all_policy ON broker_tasks;
CREATE POLICY broker_tasks_all_policy ON broker_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 3: Programmable Escrow & Payments
-- =============================================================================

CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    escrow_type VARCHAR(50) NOT NULL CHECK (escrow_type IN ('viewing_fee', 'purchase_deposit', 'full_purchase')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'UGX',
    payment_method VARCHAR(50) CHECK (payment_method IN ('mtn_momo', 'airtel_money', 'card', 'bank_transfer')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'verified', 'released', 'disputed', 'refunded')),
    pesapal_tracking_id TEXT,
    gps_verification JSONB,
    milestone JSONB,
    auto_release_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'released', 'failed')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 3
CREATE INDEX IF NOT EXISTS idx_escrow_tx_property_id ON escrow_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_buyer_id ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_seller_id ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_broker_id ON escrow_transactions(broker_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_pesapal ON escrow_transactions(pesapal_tracking_id);

CREATE INDEX IF NOT EXISTS idx_escrow_milestones_escrow_id ON escrow_milestones(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_status ON escrow_milestones(status);

-- Triggers for Feature 3
DROP TRIGGER IF EXISTS trg_escrow_transactions_updated_at ON escrow_transactions;
CREATE TRIGGER trg_escrow_transactions_updated_at
    BEFORE UPDATE ON escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_escrow_milestones_updated_at ON escrow_milestones;
CREATE TRIGGER trg_escrow_milestones_updated_at
    BEFORE UPDATE ON escrow_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 3
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS escrow_tx_select_policy ON escrow_transactions;
CREATE POLICY escrow_tx_select_policy ON escrow_transactions
    FOR SELECT USING (
        auth.uid() = buyer_id OR
        auth.uid() = seller_id OR
        EXISTS (
            SELECT 1 FROM brokers b WHERE b.id = escrow_transactions.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS escrow_tx_insert_policy ON escrow_transactions;
CREATE POLICY escrow_tx_insert_policy ON escrow_transactions
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS escrow_tx_update_policy ON escrow_transactions;
CREATE POLICY escrow_tx_update_policy ON escrow_transactions
    FOR UPDATE USING (
        auth.uid() = buyer_id OR
        auth.uid() = seller_id OR
        EXISTS (
            SELECT 1 FROM brokers b WHERE b.id = escrow_transactions.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS escrow_milestones_select_policy ON escrow_milestones;
CREATE POLICY escrow_milestones_select_policy ON escrow_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM escrow_transactions e
            WHERE e.id = escrow_milestones.escrow_id
            AND (
                e.buyer_id = auth.uid() OR
                e.seller_id = auth.uid() OR
                EXISTS (SELECT 1 FROM brokers b WHERE b.id = e.broker_id AND b.user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true))
            )
        )
    );

DROP POLICY IF EXISTS escrow_milestones_all_policy ON escrow_milestones;
CREATE POLICY escrow_milestones_all_policy ON escrow_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM escrow_transactions e
            WHERE e.id = escrow_milestones.escrow_id
            AND (
                e.buyer_id = auth.uid() OR
                e.seller_id = auth.uid() OR
                EXISTS (SELECT 1 FROM brokers b WHERE b.id = e.broker_id AND b.user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true))
            )
        )
    );


-- =============================================================================
-- FEATURE 4: Predictive Land Valuation & Arable Analytics
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    valuation_type VARCHAR(50) NOT NULL CHECK (valuation_type IN ('ai', 'comparable', 'satellite', 'soil', 'climate')),
    estimated_value NUMERIC(15, 2),
    confidence_score NUMERIC(5, 2),
    comparable_properties JSONB,
    satellite_data JSONB,
    soil_data JSONB,
    climate_data JSONB,
    crop_suitability JSONB,
    agricultural_potential_score NUMERIC(5, 2),
    development_potential_score NUMERIC(5, 2),
    valuation_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS land_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    soil_type VARCHAR(100),
    soil_ph NUMERIC(4, 2),
    elevation_m NUMERIC(10, 2),
    slope_degrees NUMERIC(5, 2),
    rainfall_mm NUMERIC(10, 2),
    temperature_avg NUMERIC(5, 2),
    vegetation_index NUMERIC(5, 4),
    arable_score NUMERIC(5, 2),
    crop_suitability JSONB,
    climate_risk_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 4
CREATE INDEX IF NOT EXISTS idx_property_valuations_property_id ON property_valuations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_valuations_type ON property_valuations(valuation_type);

CREATE INDEX IF NOT EXISTS idx_land_analytics_property_id ON land_analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_land_analytics_arable_score ON land_analytics(arable_score);

-- Triggers for Feature 4
DROP TRIGGER IF EXISTS trg_property_valuations_updated_at ON property_valuations;
CREATE TRIGGER trg_property_valuations_updated_at
    BEFORE UPDATE ON property_valuations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_land_analytics_updated_at ON land_analytics;
CREATE TRIGGER trg_land_analytics_updated_at
    BEFORE UPDATE ON land_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 4
ALTER TABLE property_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS property_valuations_select_policy ON property_valuations;
CREATE POLICY property_valuations_select_policy ON property_valuations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS property_valuations_all_policy ON property_valuations;
CREATE POLICY property_valuations_all_policy ON property_valuations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_valuations.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS land_analytics_select_policy ON land_analytics;
CREATE POLICY land_analytics_select_policy ON land_analytics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS land_analytics_all_policy ON land_analytics;
CREATE POLICY land_analytics_all_policy ON land_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = land_analytics.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 5: Tokenized Fractional Eco-Land Investment
-- =============================================================================

CREATE TABLE IF NOT EXISTS investment_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    token_symbol VARCHAR(20) NOT NULL,
    total_supply NUMERIC(20, 4) NOT NULL CHECK (total_supply > 0),
    token_price NUMERIC(15, 2) NOT NULL CHECK (token_price >= 0),
    available_supply NUMERIC(20, 4) NOT NULL CHECK (available_supply >= 0),
    minimum_investment NUMERIC(15, 2) DEFAULT 0,
    investment_status VARCHAR(50) DEFAULT 'pending' CHECK (investment_status IN ('pending', 'active', 'funded', 'closed')),
    eco_project_type VARCHAR(100),
    expected_roi NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS token_holders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES investment_tokens(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    shares_owned NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK (shares_owned >= 0),
    purchase_price NUMERIC(15, 2) NOT NULL,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    ownership_percentage NUMERIC(7, 4),
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES investment_tokens(id) ON DELETE CASCADE,
    report_period VARCHAR(50) NOT NULL,
    financial_summary JSONB,
    project_updates TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 5
CREATE INDEX IF NOT EXISTS idx_investment_tokens_property_id ON investment_tokens(property_id);
CREATE INDEX IF NOT EXISTS idx_investment_tokens_status ON investment_tokens(investment_status);
CREATE INDEX IF NOT EXISTS idx_investment_tokens_symbol ON investment_tokens(token_symbol);

CREATE INDEX IF NOT EXISTS idx_token_holders_token_id ON token_holders(token_id);
CREATE INDEX IF NOT EXISTS idx_token_holders_investor_id ON token_holders(investor_id);

CREATE INDEX IF NOT EXISTS idx_investment_reports_token_id ON investment_reports(token_id);

-- Triggers for Feature 5
DROP TRIGGER IF EXISTS trg_investment_tokens_updated_at ON investment_tokens;
CREATE TRIGGER trg_investment_tokens_updated_at
    BEFORE UPDATE ON investment_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_token_holders_updated_at ON token_holders;
CREATE TRIGGER trg_token_holders_updated_at
    BEFORE UPDATE ON token_holders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_investment_reports_updated_at ON investment_reports;
CREATE TRIGGER trg_investment_reports_updated_at
    BEFORE UPDATE ON investment_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 5
ALTER TABLE investment_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investment_tokens_select_policy ON investment_tokens;
CREATE POLICY investment_tokens_select_policy ON investment_tokens
    FOR SELECT USING (true);

DROP POLICY IF EXISTS investment_tokens_all_policy ON investment_tokens;
CREATE POLICY investment_tokens_all_policy ON investment_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = investment_tokens.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS token_holders_select_policy ON token_holders;
CREATE POLICY token_holders_select_policy ON token_holders
    FOR SELECT USING (
        auth.uid() = investor_id OR
        EXISTS (
            SELECT 1 FROM investment_tokens t
            JOIN properties p ON p.id = t.property_id
            WHERE t.id = token_holders.token_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS token_holders_all_policy ON token_holders;
CREATE POLICY token_holders_all_policy ON token_holders
    FOR ALL USING (
        auth.uid() = investor_id OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS investment_reports_select_policy ON investment_reports;
CREATE POLICY investment_reports_select_policy ON investment_reports
    FOR SELECT USING (true);

DROP POLICY IF EXISTS investment_reports_all_policy ON investment_reports;
CREATE POLICY investment_reports_all_policy ON investment_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM investment_tokens t
            JOIN properties p ON p.id = t.property_id
            WHERE t.id = investment_reports.token_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 6: Digital Land Passport
-- =============================================================================

CREATE TABLE IF NOT EXISTS land_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    passport_uid VARCHAR(100) UNIQUE NOT NULL,
    property_title TEXT,
    ownership_history JSONB,
    gps_coordinates JSONB,
    boundary_records JSONB,
    drone_imagery_urls JSONB,
    site_history JSONB,
    verification_certificates JSONB,
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'revoked')),
    issued_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 6
CREATE INDEX IF NOT EXISTS idx_land_passports_property_id ON land_passports(property_id);
CREATE INDEX IF NOT EXISTS idx_land_passports_uid ON land_passports(passport_uid);
CREATE INDEX IF NOT EXISTS idx_land_passports_status ON land_passports(verification_status);

-- Trigger for Feature 6
DROP TRIGGER IF EXISTS trg_land_passports_updated_at ON land_passports;
CREATE TRIGGER trg_land_passports_updated_at
    BEFORE UPDATE ON land_passports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 6
ALTER TABLE land_passports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS land_passports_select_policy ON land_passports;
CREATE POLICY land_passports_select_policy ON land_passports
    FOR SELECT USING (true);

DROP POLICY IF EXISTS land_passports_all_policy ON land_passports;
CREATE POLICY land_passports_all_policy ON land_passports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = land_passports.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 7: AI Land Fraud Detection
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('duplicate', 'boundary_conflict', 'document_consistency', 'suspicious_listing', 'gps_cross_verification')),
    risk_score NUMERIC(5, 2),
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    detected_issues JSONB,
    verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'cleared')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 7
CREATE INDEX IF NOT EXISTS idx_fraud_checks_property_id ON fraud_checks(property_id);
CREATE INDEX IF NOT EXISTS idx_fraud_checks_risk_level ON fraud_checks(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_checks_status ON fraud_checks(status);

-- Trigger for Feature 7
DROP TRIGGER IF EXISTS trg_fraud_checks_updated_at ON fraud_checks;
CREATE TRIGGER trg_fraud_checks_updated_at
    BEFORE UPDATE ON fraud_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 7
ALTER TABLE fraud_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fraud_checks_select_policy ON fraud_checks;
CREATE POLICY fraud_checks_select_policy ON fraud_checks
    FOR SELECT USING (
        auth.uid() = verified_by OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = fraud_checks.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS fraud_checks_all_policy ON fraud_checks;
CREATE POLICY fraud_checks_all_policy ON fraud_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 8: Smart Property Matching
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2),
    budget_match NUMERIC(5, 2),
    location_match NUMERIC(5, 2),
    acreage_match NUMERIC(5, 2),
    agricultural_match NUMERIC(5, 2),
    investment_match NUMERIC(5, 2),
    roi_score NUMERIC(5, 2),
    match_reasons JSONB,
    user_viewed BOOLEAN DEFAULT FALSE,
    user_liked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_search_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    budget_min NUMERIC(15, 2),
    budget_max NUMERIC(15, 2),
    preferred_locations JSONB,
    preferred_acreage_min NUMERIC(10, 2),
    preferred_acreage_max NUMERIC(10, 2),
    agricultural_use BOOLEAN DEFAULT FALSE,
    investment_goal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 8
CREATE INDEX IF NOT EXISTS idx_property_matches_user_id ON property_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_property_matches_property_id ON property_matches(property_id);
CREATE INDEX IF NOT EXISTS idx_property_matches_score ON property_matches(match_score);

CREATE INDEX IF NOT EXISTS idx_user_search_profiles_user_id ON user_search_profiles(user_id);

-- Triggers for Feature 8
DROP TRIGGER IF EXISTS trg_property_matches_updated_at ON property_matches;
CREATE TRIGGER trg_property_matches_updated_at
    BEFORE UPDATE ON property_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_search_profiles_updated_at ON user_search_profiles;
CREATE TRIGGER trg_user_search_profiles_updated_at
    BEFORE UPDATE ON user_search_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 8
ALTER TABLE property_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS property_matches_select_policy ON property_matches;
CREATE POLICY property_matches_select_policy ON property_matches
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_matches.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS property_matches_all_policy ON property_matches;
CREATE POLICY property_matches_all_policy ON property_matches
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS user_search_profiles_select_policy ON user_search_profiles;
CREATE POLICY user_search_profiles_select_policy ON user_search_profiles
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS user_search_profiles_all_policy ON user_search_profiles;
CREATE POLICY user_search_profiles_all_policy ON user_search_profiles
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 9: Remote Site-Visit Technology
-- =============================================================================

CREATE TABLE IF NOT EXISTS site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('physical', 'virtual', 'drone')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    gps_checkin JSONB,
    geotagged_media JSONB,
    drone_inspection_url TEXT,
    virtual_tour_url TEXT,
    visit_report TEXT,
    auto_report JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 9
CREATE INDEX IF NOT EXISTS idx_site_visits_property_id ON site_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON site_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_broker_id ON site_visits(broker_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_status ON site_visits(status);

-- Trigger for Feature 9
DROP TRIGGER IF EXISTS trg_site_visits_updated_at ON site_visits;
CREATE TRIGGER trg_site_visits_updated_at
    BEFORE UPDATE ON site_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 9
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_visits_select_policy ON site_visits;
CREATE POLICY site_visits_select_policy ON site_visits
    FOR SELECT USING (
        auth.uid() = visitor_id OR
        EXISTS (
            SELECT 1 FROM brokers b WHERE b.id = site_visits.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM properties p WHERE p.id = site_visits.property_id AND p.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );

DROP POLICY IF EXISTS site_visits_all_policy ON site_visits;
CREATE POLICY site_visits_all_policy ON site_visits
    FOR ALL USING (
        auth.uid() = visitor_id OR
        EXISTS (
            SELECT 1 FROM brokers b WHERE b.id = site_visits.broker_id AND b.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );


-- =============================================================================
-- FEATURE 10: Eco-Land Investment Intelligence
-- =============================================================================

CREATE TABLE IF NOT EXISTS eco_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    carbon_potential_score NUMERIC(5, 2),
    green_development_potential NUMERIC(5, 2),
    reforestation_opportunities JSONB,
    agroforestry_analysis JSONB,
    renewable_energy_suitability JSONB,
    climate_resilience_score NUMERIC(5, 2),
    sustainable_development_score NUMERIC(5, 2),
    eco_certifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Feature 10
CREATE INDEX IF NOT EXISTS idx_eco_analytics_property_id ON eco_analytics(property_id);

-- Trigger for Feature 10
DROP TRIGGER IF EXISTS trg_eco_analytics_updated_at ON eco_analytics;
CREATE TRIGGER trg_eco_analytics_updated_at
    BEFORE UPDATE ON eco_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Feature 10
ALTER TABLE eco_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eco_analytics_select_policy ON eco_analytics;
CREATE POLICY eco_analytics_select_policy ON eco_analytics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS eco_analytics_all_policy ON eco_analytics;
CREATE POLICY eco_analytics_all_policy ON eco_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = eco_analytics.property_id
            AND (p.owner_id = auth.uid() OR p.broker_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
        )
    );
