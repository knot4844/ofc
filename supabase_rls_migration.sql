-- 1. `businesses` 테이블에 `owner_id` 추가 (사용자 구분 목적)
-- Supabase의 내장 유저 테이블인 `auth.users`를 참조합니다.
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 데이터(대우오피스 등)를 유지하기 위해, 현재 데이터의 owner_id를 임시로 허용(NULL)해 두지만, 
-- 궁극적으로는 데이터 무결성을 위해 NOT NULL로 가야합니다. 
-- 당분간은 B2B 전환기이므로 NULL을 허용해 둡니다.

-- 2. 모든 주요 테이블에 RLS(행 수준 보안) 활성화
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY; -- (결제/납부내역 테이블이 추후 생기면 주석 해제)

-- 3. RLS 정책(Policies) 생성
-- (A) 사업장(businesses) 정책: 자기가 소유한 사업장만 CRUD 가능
CREATE POLICY "Users can fully manage their own businesses"
ON businesses
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- (B) 호실(rooms) 정책: 자신이 소유한 사업장에 속한 호실만 CRUD 가능
CREATE POLICY "Users can fully manage rooms in their businesses"
ON rooms
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = rooms.business_id 
        AND businesses.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = rooms.business_id 
        AND businesses.owner_id = auth.uid()
    )
);

-- 참고: 현재는 기존 데이터가 owner_id = NULL 이기 때문에, 
-- 로컬/기존 개발자가 테스트 시 데이터가 안 보일 수 있습니다.
-- 서비스 런칭 전에는 반드시 기존 테스트 데이터를 모두 날리거나 특정 auth.uid()로 업데이트 해야 합니다.
