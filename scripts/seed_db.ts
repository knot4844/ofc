import { createClient } from '@supabase/supabase-js';
import { allRooms } from '../src/lib/data';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("🚀 시작: Supabase DB에 초기 호실 데이터를 밀어넣습니다...");
    let successCount = 0;

    for (const r of allRooms) {
        const payload = {
            id: r.id,
            business_id: r.businessId,
            name: r.name,
            status: r.status,
            auto_notify: r.autoNotify || false,
            unpaid_months: r.unpaidMonths || 0,
            unpaid_amount: r.unpaidAmount || 0,
            lease_start: r.leaseStart || null,
            lease_end: r.leaseEnd || null,
            deposit: r.paymentInfo?.deposit || 0,
            monthly_rent: r.paymentInfo?.monthlyRent || 0,
            due_date: r.paymentInfo?.dueDate || null,
            is_vat_included: r.paymentInfo?.isVATIncluded || false,
            tenant_id: r.tenant?.id || null,
            tenant_name: r.tenant?.name || null,
            tenant_contact: r.tenant?.contact || null,
            tenant_company_name: r.tenant?.companyName || null,
            tenant_business_reg_num: r.tenant?.businessRegistrationNumber || null,
        };
        const { error } = await supabase.from('rooms').upsert(payload);
        if (error) {
            console.error(`❌ 에러 발생 (${r.name}):`, error.message);
        } else {
            successCount++;
        }
    }
    console.log(`✅ 완료! 총 ${successCount}개의 호실 데이터가 Supabase에 저장되었습니다.`);
}

seed();
