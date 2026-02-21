import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    // 1. Check authorization
    // In a real application, we would check the user's session token here
    // Verify if the user.email is in the MASTER_ADMIN_EMAILS list.
    // For simplicity in this demo, we'll assume the frontend will only call this if authorized,
    // or we can pass the user email as a secure header/cookie.
    // However, it's safer to just require an admin secret key via header for this demo.
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.MASTER_ADMIN_SECRET || 'daewoo-master-secret-2026';

    if (authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json({ error: 'Unauthorized. Admin access only.' }, { status: 401 });
    }

    // 2. Initialize Admin Supabase Client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            { error: 'Server configuration missing: SUPABASE_SERVICE_ROLE_KEY is required.' },
            { status: 500 }
        );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    try {
        // 3. Fetch aggregated stats
        const { count: businessesCount } = await supabaseAdmin.from('businesses').select('*', { count: 'exact', head: true });
        const { count: roomsCount } = await supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true });
        const { count: tenantsCount } = await supabaseAdmin.from('tenants').select('*', { count: 'exact', head: true });

        // 4. Fetch recent businesses
        const { data: recentBusinesses } = await supabaseAdmin
            .from('businesses')
            .select('id, name, owner_id, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            stats: {
                totalBusinesses: businessesCount || 0,
                totalRooms: roomsCount || 0,
                totalTenants: tenantsCount || 0,
                monthlyRecurringRevenue: (businessesCount || 0) * 29000, // Dummy calculation for MRR based on 29k Pro plan
            },
            recentBusinesses: recentBusinesses || [],
        });
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
