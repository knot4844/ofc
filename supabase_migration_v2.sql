-- ============================================================
-- Supabase Migration v2: owner_id + payments + RLS
-- Daewoo Office / noado
-- 2026-03-04
-- ============================================================

-- 1. businesses 테이블에 owner_id 추가
ALTER TABLE businesses
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. rooms 테이블에 owner_id 추가
ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. payments 테이블 생성
CREATE TABLE IF NOT EXISTS payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
    room_id     TEXT REFERENCES rooms(id) ON DELETE SET NULL,
    owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL DEFAULT '',
    amount      BIGINT NOT NULL DEFAULT 0,
    paid_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    month       TEXT NOT NULL,          -- e.g. '2026-03'
    status      TEXT NOT NULL CHECK (status IN ('PAID', 'UNPAID', 'PARTIAL')) DEFAULT 'PAID',
    note        TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. RLS 활성화
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;

-- 5. 기존 RLS 정책 삭제 후 재생성
DROP POLICY IF EXISTS "businesses_owner_select" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_delete" ON businesses;

DROP POLICY IF EXISTS "rooms_owner_select" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_insert" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_update" ON rooms;
DROP POLICY IF EXISTS "rooms_owner_delete" ON rooms;

DROP POLICY IF EXISTS "payments_owner_select" ON payments;
DROP POLICY IF EXISTS "payments_owner_insert" ON payments;
DROP POLICY IF EXISTS "payments_owner_update" ON payments;
DROP POLICY IF EXISTS "payments_owner_delete" ON payments;

-- businesses RLS 정책
CREATE POLICY "businesses_owner_select" ON businesses FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "businesses_owner_insert" ON businesses FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses_owner_update" ON businesses FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "businesses_owner_delete" ON businesses FOR DELETE USING (owner_id = auth.uid());

-- rooms RLS 정책 (owner_id 직접 비교)
CREATE POLICY "rooms_owner_select" ON rooms FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "rooms_owner_insert" ON rooms FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "rooms_owner_update" ON rooms FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "rooms_owner_delete" ON rooms FOR DELETE USING (owner_id = auth.uid());

-- payments RLS 정책
CREATE POLICY "payments_owner_select" ON payments FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "payments_owner_insert" ON payments FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "payments_owner_update" ON payments FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "payments_owner_delete" ON payments FOR DELETE USING (owner_id = auth.uid());

-- 6. tenant_profiles 테이블에도 RLS가 없으면 추가 (임차인 온보딩에서 생성됨)
ALTER TABLE IF EXISTS tenant_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_profiles_owner_select" ON tenant_profiles;
DROP POLICY IF EXISTS "tenant_profiles_self_select" ON tenant_profiles;

-- 임대인은 본인 사업장 임차인 프로필 조회 가능
CREATE POLICY "tenant_profiles_self_select" ON tenant_profiles
    FOR SELECT USING (auth_id = auth.uid());

-- 7. payments 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_owner_id    ON payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_room_id     ON payments(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_month       ON payments(month);

-- 8. 기존 mock INSERT 데이터(supabase_schema.sql에서 삽입된 것)는
--    owner_id = NULL 이므로 실제 사용자 로그인 후 별도로 사업장 등록 필요.
--    (mock 데이터는 RLS 통과 불가 — 정상 동작)


-- 9. businesses 테이블에 건물주 전화번호 추가 (알림톡 발송용)
ALTER TABLE businesses
    ADD COLUMN IF NOT EXISTS owner_phone TEXT;
