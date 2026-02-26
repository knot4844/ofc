-- ============================================================
-- Core Schema Migration: businesses + rooms + payments
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. BUSINESSES 테이블 (사업장)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    owner_name TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "businesses_owner_select" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_delete" ON businesses;

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_owner_select" ON businesses FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "businesses_owner_insert" ON businesses FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses_owner_update" ON businesses FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "businesses_owner_delete" ON businesses FOR DELETE USING (owner_id = auth.uid());

-- 2. ROOMS 테이블 (호실)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'UNPAID', 'VACANT')),
    tenant_name TEXT,
    tenant_contact TEXT,
    tenant_company_name TEXT,
    tenant_business_reg_num TEXT,
    monthly_rent INTEGER DEFAULT 0,
    deposit INTEGER DEFAULT 0,
    due_date TEXT DEFAULT '매월 25일',
    is_vat_included BOOLEAN DEFAULT FALSE,
    auto_notify BOOLEAN DEFAULT TRUE,
    lease_start DATE,
    lease_end DATE,
    unpaid_months INTEGER DEFAULT 0,
    unpaid_amount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "rooms_owner_select" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_insert" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_update" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_delete" ON rooms;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_owner_select" ON rooms FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "rooms_owner_insert" ON rooms FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "rooms_owner_update" ON rooms FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "rooms_owner_delete" ON rooms FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

-- 3. PAYMENTS 테이블 (납부 내역)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    paid_at DATE NOT NULL,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "payments_owner_select" ON payments;
DROP POLICY IF EXISTS "payments_owner_insert" ON payments;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_owner_select" ON payments FOR SELECT USING (
    room_id IN (
        SELECT r.id FROM rooms r
        JOIN businesses b ON r.business_id = b.id
        WHERE b.owner_id = auth.uid()
    )
);
CREATE POLICY "payments_owner_insert" ON payments FOR INSERT WITH CHECK (
    room_id IN (
        SELECT r.id FROM rooms r
        JOIN businesses b ON r.business_id = b.id
        WHERE b.owner_id = auth.uid()
    )
);

-- 4. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
CREATE TRIGGER rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
