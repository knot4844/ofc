import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { businesses, allRooms } from "@/lib/data";
import { sendKakaoAlimtalk } from "@/lib/alimtalk";

export async function GET(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Vercel Cron securely calls this endpoint via authorization header in production
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        console.log(`[CRON EXECUTING] /api/cron/daily-briefing`);

        for (const business of businesses) {
            const rooms = allRooms.filter(r => r.businessId === business.id);
            const unpaid = rooms.filter(r => r.status === "UNPAID");
            const vacant = rooms.filter(r => r.status === "VACANT");

            const stats = {
                businessName: business.name,
                date: new Date().toLocaleDateString('ko-KR'),
                totalRooms: rooms.length,
                unpaidCount: unpaid.length,
                unpaidAmount: unpaid.reduce((sum, r) => sum + (r.unpaidAmount || 0), 0),
                vacantCount: vacant.length,
            };

            const prompt = `
                당신은 부동산 임대업 SaaS '대우오피스 파트너스'의 AI 비서입니다.
                다음과 같은 건물 현황 통계가 주어집니다:
                ${JSON.stringify(stats, null, 2)}
                최고경영자(${business.ownerName})에게 아침 인사와 함께 핵심 이슈 3~4문장 내외로만 요약해 카카오톡 알림톡으로 보낼 짧은 브리핑 메시지를 작성하세요.
                가독성을 위해 볼드를 마크다운으로 넣지 말고, 순수 텍스트 줄바꿈만 사용하세요.
            `;

            const result = await model.generateContent(prompt);
            const reportContent = result.response.text();

            // Send via Alimtalk
            await sendKakaoAlimtalk({
                to: "010-1234-5678", // Owner's registered phone
                templateCode: "DAILY_BRIEFING_001",
                variables: {
                    ownerName: business.ownerName,
                    reportContent: reportContent.trim()
                }
            });
        }

        return NextResponse.json({ success: true, message: "Daily brief dispatched." });
    } catch (error: any) {
        console.error("Cron Daily Briefing Error:", error?.message || error);
        return NextResponse.json({ success: false, error: "Failed to dispatch daily brief", details: error?.message || String(error) }, { status: 500 });
    }
}
