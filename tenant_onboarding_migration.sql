-- =============================================
-- 임차인 온보딩 마이그레이션
-- =============================================

-- 1. rooms 테이블에 초대/인증 컬럼 추가
ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS tenant_invite_token TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS tenant_email TEXT,
    ADD COLUMN IF NOT EXISTS tenant_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. tenant_profiles 테이블 생성 (임차인 기본 정보)
CREATE TABLE IF NOT EXISTS tenant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

    -- 기본 정보
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    ssn_hash TEXT NOT NULL,      -- 주민번호 SHA-256 해시 (원문 미저장)
    ssn_last4 TEXT,              -- 뒷자리 앞 1자리만 마스킹 표시용 (예: 1xxxxxx)
    email TEXT,
    address TEXT,

    -- 메타
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (auth_id),
    UNIQUE (room_id)
);

-- 3. RLS 활성화
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;

-- 임차인 본인만 자기 프로필 조회 가능
DROP POLICY IF EXISTS "tenant_profiles_self_select" ON tenant_profiles;
CREATE POLICY "tenant_profiles_self_select" ON tenant_profiles
    FOR SELECT USING (auth_id = auth.uid());

-- SERVICE_ROLE로만 INSERT/UPDATE (API 라우트에서만)
DROP POLICY IF EXISTS "tenant_profiles_service_insert" ON tenant_profiles;
CREATE POLICY "tenant_profiles_service_insert" ON tenant_profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "tenant_profiles_service_update" ON tenant_profiles;
CREATE POLICY "tenant_profiles_service_update" ON tenant_profiles
    FOR UPDATE USING (true);

-- 관리자(임대인)는 자기 사업장 임차인 프로필 조회 가능
DROP POLICY IF EXISTS "tenant_profiles_owner_select" ON tenant_profiles;
CREATE POLICY "tenant_profiles_owner_select" ON tenant_profiles
    FOR SELECT USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN businesses b ON r.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );
