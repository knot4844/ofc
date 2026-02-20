-- Supabase Schema Initialization for Daewoo Office

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    registration_number TEXT,
    address TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Rooms Table (Includes Tenant Info for simplicity in this version)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('VACANT', 'PAID', 'UNPAID', 'PENDING')),
    auto_notify BOOLEAN DEFAULT false,
    unpaid_months INTEGER DEFAULT 0,
    unpaid_amount INTEGER DEFAULT 0,
    
    -- Lease Details
    lease_start TEXT,
    lease_end TEXT,
    
    -- Payment Details
    deposit INTEGER DEFAULT 0,
    monthly_rent INTEGER DEFAULT 0,
    due_date TEXT,
    is_vat_included BOOLEAN DEFAULT false,
    
    -- Tenant Details
    tenant_id TEXT,
    tenant_name TEXT,
    tenant_contact TEXT,
    tenant_company_name TEXT,
    tenant_business_reg_num TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to handle `updated_at` automatically
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rooms table
DROP TRIGGER IF EXISTS set_updated_at ON rooms;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();


-- Insert Initial Mock Data
INSERT INTO businesses (id, name, owner_name, registration_number, address, contact) VALUES
('b_daewoo', '대우오피스', '김대우', '123-45-67890', '서울시 강남구 테헤란로 123', '02-1234-5678'),
('b_harim', '하림산업', '이하림', '987-65-43210', '경기도 성남시 분당구 판교역로 456', '031-987-6543'),
('b_bullo', '불로장생', '박장생', '111-22-33333', '서울시 종로구 세종대로 789', '02-111-2222')
ON CONFLICT (id) DO NOTHING;
