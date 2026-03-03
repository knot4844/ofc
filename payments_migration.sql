-- payments 테이블 생성
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_name TEXT,
    amount INTEGER NOT NULL,
    paid_at DATE NOT NULL,
    month TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PAID', 'UNPAID', 'PARTIAL')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: owner_id 기반 접근 제어
CREATE POLICY "payments_owner_select" ON payments
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_owner_insert" ON payments
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_owner_update" ON payments
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- 시드 데이터: 대우 고시원 (b_daewoo) 최근 3개월 납부 이력
INSERT INTO payments (id, business_id, room_id, tenant_name, amount, paid_at, month, status, note) VALUES
-- 2026년 1월
('pay_001', 'b_daewoo', 'r_b_daewoo_0', '임차인_201호', 350000, '2026-01-05', '2026-01', 'PAID', NULL),
('pay_002', 'b_daewoo', 'r_b_daewoo_1', '임차인_202호', 420000, '2026-01-07', '2026-01', 'PAID', NULL),
('pay_003', 'b_daewoo', 'r_b_daewoo_2', '임차인_203호', 380000, '2026-01-10', '2026-01', 'PAID', NULL),
('pay_004', 'b_daewoo', 'r_b_daewoo_3', '임차인_204호', 450000, '2026-01-15', '2026-01', 'UNPAID', '1월 미납'),
('pay_005', 'b_daewoo', 'r_b_daewoo_4', '임차인_205호', 390000, '2026-01-20', '2026-01', 'PAID', NULL),

-- 2026년 2월
('pay_006', 'b_daewoo', 'r_b_daewoo_0', '임차인_201호', 350000, '2026-02-04', '2026-02', 'PAID', NULL),
('pay_007', 'b_daewoo', 'r_b_daewoo_1', '임차인_202호', 420000, '2026-02-06', '2026-02', 'PAID', NULL),
('pay_008', 'b_daewoo', 'r_b_daewoo_2', '임차인_203호', 380000, '2026-02-11', '2026-02', 'UNPAID', '2월 미납'),
('pay_009', 'b_daewoo', 'r_b_daewoo_3', '임차인_204호', 450000, '2026-02-15', '2026-02', 'UNPAID', '2월 연속 미납'),
('pay_010', 'b_daewoo', 'r_b_daewoo_4', '임차인_205호', 390000, '2026-02-18', '2026-02', 'PAID', NULL),
('pay_011', 'b_daewoo', 'r_b_daewoo_5', '임차인_206호', 500000, '2026-02-20', '2026-02', 'PAID', NULL),
('pay_012', 'b_daewoo', 'r_b_daewoo_6', '임차인_207호', 460000, '2026-02-22', '2026-02', 'PAID', NULL),

-- 2026년 3월 (이번 달, 일부만 납부)
('pay_013', 'b_daewoo', 'r_b_daewoo_0', '임차인_201호', 350000, '2026-03-03', '2026-03', 'PAID', NULL),
('pay_014', 'b_daewoo', 'r_b_daewoo_1', '임차인_202호', 420000, '2026-03-02', '2026-03', 'PAID', NULL),
('pay_015', 'b_daewoo', 'r_b_daewoo_2', '임차인_203호', 380000, '2026-03-01', '2026-03', 'UNPAID', '3월 미납'),
('pay_016', 'b_daewoo', 'r_b_daewoo_3', '임차인_204호', 450000, '2026-03-01', '2026-03', 'UNPAID', '3월 연속3회 미납'),

-- 로얄 오피스텔 (b_royal)
('pay_017', 'b_royal', 'r_b_royal_0', '임차인_101호', 850000, '2026-02-10', '2026-02', 'PAID', NULL),
('pay_018', 'b_royal', 'r_b_royal_1', '임차인_102호', 920000, '2026-02-12', '2026-02', 'PAID', NULL),
('pay_019', 'b_royal', 'r_b_royal_2', '임차인_103호', 780000, '2026-02-15', '2026-02', 'UNPAID', '2월 미납'),
('pay_020', 'b_royal', 'r_b_royal_0', '임차인_101호', 850000, '2026-03-03', '2026-03', 'PAID', NULL),

-- 테헤란로상가 (b_teheran)
('pay_021', 'b_teheran', 'r_b_teheran_0', '임차인_101호', 1500000, '2026-02-05', '2026-02', 'PAID', NULL),
('pay_022', 'b_teheran', 'r_b_teheran_1', '임차인_102호', 2000000, '2026-02-08', '2026-02', 'PAID', NULL),
('pay_023', 'b_teheran', 'r_b_teheran_2', '임차인_103호', 1800000, '2026-02-10', '2026-02', 'UNPAID', '상가 미납'),
('pay_024', 'b_teheran', 'r_b_teheran_0', '임차인_101호', 1500000, '2026-03-02', '2026-03', 'PAID', NULL)
ON CONFLICT (id) DO NOTHING;
