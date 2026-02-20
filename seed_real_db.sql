-- 0. 테이블에 owner_id 컬럼 추가 (아직 추가되지 않은 경우 대비)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1. 데모용 사업장 데이터 초기화 (owner_id를 NULL로 지정하여 데모 환경용 공용 데이터로 만듭니다)
INSERT INTO businesses (id, name, owner_name, address) VALUES
('b_daewoo', '대우오피스', '대표님', '서울시 강남구 역삼동'),
('b_royal', '로얄 오피스텔', '대표님', '서울시 서초구 서초동'),
('b_teheran', '테헤란로 상가', '대표님', '서울시 강남구 테헤란로')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    owner_name = EXCLUDED.owner_name, 
    address = EXCLUDED.address,
    owner_id = NULL;

-- 2. 기존 호실(Rooms) 데이터 초기화 및 데모 데이터 삽입
DELETE FROM rooms WHERE business_id IN ('b_daewoo', 'b_royal', 'b_teheran');

-- 데모 호실 생성 처리를 위해 DO 블록 사용
DO $$
DECLARE
    bz RECORD;
    b_id TEXT;
    r_count INT;
    start_num INT;
    i INT;
    monthly_rent INT;
    deposit INT;
    status TEXT;
    room_name TEXT;
    tenant_id TEXT;
BEGIN
    FOR bz IN SELECT * FROM (VALUES ('b_daewoo', 30, 201), ('b_royal', 5, 101), ('b_teheran', 12, 101)) AS t(id, count, start_num) LOOP
        b_id := bz.id;
        r_count := bz.count;
        start_num := bz.start_num;

        FOR i IN 0..(r_count - 1) LOOP
            -- 30만 ~ 60만 사이 1만원 단위
            monthly_rent := (30 + floor(random() * 31)::int) * 10000;
            deposit := monthly_rent * 10;
            
            -- 상태 결정 (15% 공실, 25% 미납)
            IF random() < 0.15 THEN
                status := 'VACANT';
            ELSIF random() < 0.25 THEN
                status := 'UNPAID';
            ELSE
                status := 'PAID';
            END IF;

            room_name := (start_num + i)::text || '호';
            tenant_id := MD5(random()::text);

            INSERT INTO rooms (
                id, business_id, name, status, auto_notify, unpaid_months, unpaid_amount,
                lease_start, lease_end, deposit, monthly_rent, due_date, is_vat_included,
                tenant_id, tenant_name, tenant_contact, tenant_company_name, tenant_business_reg_num
            ) VALUES (
                'r_' || b_id || '_' || i::text,
                b_id,
                room_name,
                status,
                CASE WHEN status != 'VACANT' AND random() > 0.5 THEN true ELSE false END,
                CASE WHEN status = 'UNPAID' THEN floor(random() * 3 + 1)::int ELSE 0 END,
                CASE WHEN status = 'UNPAID' THEN monthly_rent * floor(random() * 3 + 1)::int ELSE 0 END,
                CASE WHEN status = 'VACANT' THEN NULL ELSE '2024-01-01' END,
                CASE WHEN status = 'VACANT' THEN NULL WHEN random() > 0.8 THEN '2024-11-30' ELSE '2025-12-31' END,
                deposit,
                monthly_rent,
                '매월 ' || floor(random() * 28 + 1)::text || '일',
                false,
                CASE WHEN status = 'VACANT' THEN NULL ELSE tenant_id END,
                CASE WHEN status = 'VACANT' THEN NULL ELSE '임차인_' || room_name END,
                CASE WHEN status = 'VACANT' THEN NULL ELSE '010-' || floor(1000 + random() * 9000)::text || '-' || floor(1000 + random() * 9000)::text END,
                CASE WHEN status = 'VACANT' THEN NULL ELSE '(주)비즈_' || room_name END,
                CASE WHEN status = 'VACANT' THEN NULL ELSE floor(100 + random() * 899)::text || '-81-' || floor(10000 + random() * 89999)::text END
            );
        END LOOP;
    END LOOP;
END $$;

-- 3. RLS 정책 업데이트 (데모 환경 무인증 접속 지원을 위해 NULL owner_id 는 모두에게 허용)
-- (기존에 있던 정책 삭제)
DROP POLICY IF EXISTS "Users can fully manage their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can fully manage rooms in their businesses" ON rooms;

-- (새 정책 적용)
CREATE POLICY "Users can fully manage their own businesses OR access demo businesses"
ON businesses
FOR ALL
USING (auth.uid() = owner_id OR owner_id IS NULL)
WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can fully manage rooms in their businesses OR access demo rooms"
ON rooms
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = rooms.business_id 
        AND (businesses.owner_id = auth.uid() OR businesses.owner_id IS NULL)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = rooms.business_id 
        AND (businesses.owner_id = auth.uid() OR businesses.owner_id IS NULL)
    )
);
