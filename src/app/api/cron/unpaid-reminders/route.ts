import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendKakaoAlimtalk } from "@/lib/alimtalk";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    // Vercel Cron 보안
    const authHeader = req.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        console.log(`[CRON] /api/cron/unpaid-reminders 실행`);

        // 1. auto_notify=true인 미납 호실 + 임차인 연락처 조회
        const { data: unpaidRooms, error } = await supabaseAdmin
            .from("rooms")
            .select("id, name, tenant_name, tenant_contact, unpaid_amount, unpaid_months, auto_notify, status")
            .eq("status", "UNPAID")
            .eq("auto_notify", true);

        if (error) throw error;

        const rooms = unpaidRooms || [];
        let dispatchedCount = 0;
        const results: { room: string; sent: boolean; reason?: string }[] = [];

        for (const room of rooms) {
            if (!room.tenant_contact) {
                results.push({ room: room.name, sent: false, reason: "연락처 없음" });
                continue;
            }

            const sent = await sendKakaoAlimtalk({
                to: room.tenant_contact.replace(/-/g, ""),
                templateCode: "KA01TP260302200441583wMOcyLIy71M", // 미납 독촉
                variables: {
                    tenantName: room.tenant_name || "임차인",
                    roomName: room.name,
                    unpaidAmount: (room.unpaid_amount || 0).toLocaleString(),
                    unpaidMonths: String(room.unpaid_months || 1),
                },
            });

            results.push({ room: room.name, sent });
            if (sent) dispatchedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `${dispatchedCount}명에게 미납 알림 발송 완료`,
            results,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[CRON] unpaid-reminders 오류:", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
