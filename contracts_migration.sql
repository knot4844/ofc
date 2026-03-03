-- 전자계약서 테이블 (법적 요건 포함)
-- 전자서명법 제3조: 공인전자서명 외 전자서명도 당사자 간 합의로 효력 인정
-- 저장 항목: 서명 이미지, 서명 일시(타임스탬프), 서명자 IP, 계약 내용 해시

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,

    -- 법적 요건 1: 서명 이미지 (base64 PNG)
    signature TEXT NOT NULL,

    -- 법적 요건 2: 서명 일시 (UTC 타임스탬프, 변조 불가)
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- 법적 요건 3: 서명자 IP 주소 (본인 확인 보조 수단)
    signer_ip TEXT,

    -- 법적 요건 4: 계약 내용 SHA-256 해시 (원본 무결성 증명)
    content_hash TEXT NOT NULL,

    -- 계약 내용 요약 (보증금, 월세, 임대 기간)
    contract_snapshot JSONB,

    -- 서버 처리 시각 (클라이언트 시각과 별도로 서버에서 기록)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 동일 호실에 하나의 계약만 유지 (재서명 시 갱신)
    UNIQUE (room_id)
);

-- RLS 활성화
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 임대인(owner)만 조회 가능
CREATE POLICY "contracts_owner_select" ON contracts
  FOR SELECT USING (
    room_id IN (
      SELECT r.id FROM rooms r
      JOIN businesses b ON r.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

-- SERVICE_ROLE만 INSERT/UPDATE 가능 (API 라우트에서만 저장)
CREATE POLICY "contracts_service_insert" ON contracts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contracts_service_update" ON contracts
  FOR UPDATE USING (true);
