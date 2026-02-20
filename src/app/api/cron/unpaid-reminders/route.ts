import { NextResponse } from "next/server";
import { allRooms } from "@/lib/data";
import { sendKakaoAlimtalk } from "@/lib/alimtalk";

export async function GET(req: Request) {
    // Vercel Cron securely calls this endpoint via authorization header in production
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        console.log(`[CRON EXECUTING] /api/cron/unpaid-reminders`);

        // Find all unpaid rooms with automatic notification enabled
        const unpaidRoomsToNotify = allRooms.filter(r => r.status === "UNPAID" && r.autoNotify && r.tenant);

        let dispatchedCount = 0;

        for (const room of unpaidRoomsToNotify) {
            // Send via Alimtalk
            await sendKakaoAlimtalk({
                to: room.tenant!.contact || "010-0000-0000",
                templateCode: "UNPAID_REMINDER_001",
                variables: {
                    tenantName: room.tenant!.companyName || room.tenant!.name,
                    roomName: room.name,
                    unpaidAmount: (room.unpaidAmount || 0).toLocaleString()
                }
            });
            dispatchedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Dispatched unpaid reminders to ${dispatchedCount} tenants.`
        });
    } catch (error: any) {
        console.error("Cron Unpaid Reminders Error:", error);
        return NextResponse.json({ success: false, error: "Failed to dispatch reminders" }, { status: 500 });
    }
}
