import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { sendKakaoAlimtalk } from "@/lib/alimtalk";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    // Vercel Cron 보안: CRON_SECRET으로 인증 (프로덕션)
    const authHeader = req.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ success: false, error: "GEMINI_API_KEY 미설정" }, { status: 500 });
    }

    try {
        console.log(`[CRON] /api/cron/daily-briefing 실행`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Supabase에서 모든 사업장 가져오기 (owner_phone이 있는 것만)
        const { data: bizList, error: bizError } = await supabaseAdmin
            .from("businesses")
            .select("id, name, owner_name, owner_phone");

        if (bizError) throw bizError;
        if (!bizList || bizList.length === 0) {
            return NextResponse.json({ success: true, message: "사업장 없음" });
        }

        const results: { business: string; sent: boolean }[] = [];

        for (const biz of bizList) {
            // 알림 받을 전화번호가 없으면 skip
            if (!biz.owner_phone) {
                console.log(`[SKIP] ${biz.name} — 건물주 전화번호 없음`);
                continue;
            }

            // 2. 해당 사업장 호실 현황 조회
            const { data: rooms } = await supabaseAdmin
                .from("rooms")
                .select("id, status, unpaid_amount, monthly_rent")
                .eq("business_id", biz.id);

            const roomList = rooms || [];
            const unpaid = roomList.filter(r => r.status === "UNPAID");
            const vacant = roomList.filter(r => r.status === "VACANT");
            const unpaidAmount = unpaid.reduce((sum, r) => sum + (r.unpaid_amount || 0), 0);

            const stats = {
                businessName: biz.name,
                date: new Date().toLocaleDateString("ko-KR"),
                totalRooms: roomList.length,
                unpaidCount: unpaid.length,
                unpaidAmount,
                vacantCount: vacant.length,
            };

            // 3. Gemini로 브리핑 생성
            const prompt = `당신은 부동산 임대업 SaaS 'noado'의 AI 비서입니다.
다음 건물 현황을 ${biz.owner_name}님에게 아침 인사와 함께 핵심 이슈 3~4문장 내외로 요약해 카카오톡으로 보낼 짧은 브리핑 메시지를 작성하세요.
마크다운(볼드 등) 없이 순수 텍스트 줄바꿈만 사용하세요.

현황:
${JSON.stringify(stats, null, 2)}`;

            const result = await model.generateContent(prompt);
            const reportContent = result.response.text().trim();

            // 4. 알림톡 발송
            const sent = await sendKakaoAlimtalk({
                to: biz.owner_phone.replace(/-/g, ""), // 하이픈 제거
                templateCode: "KA01TP260302200255741jxhgbrVAp1l", // 일일 브리핑
                variables: {
                    ownerName: biz.owner_name || "대표",
                    reportContent,
                },
            });

            results.push({ business: biz.name, sent });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[CRON] daily-briefing 오류:", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
