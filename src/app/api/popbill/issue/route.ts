import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { payments } = await req.json();

        if (!payments || !Array.isArray(payments) || payments.length === 0) {
            return NextResponse.json({ error: '발행할 수납 내역이 없습니다.' }, { status: 400 });
        }

        // Mock Popbill API call
        // In reality, this would use the Popbill Node.js SDK to issue electronic tax invoices
        console.log(`[Popbill Mock API] 매칭된 ${payments.length}건의 세금계산서 자동 발행을 요청합니다.`);

        // Simulating API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const results = payments.map(p => ({
            id: p.id,
            depositor: p.depositor,
            amount: p.amount,
            status: 'SUCCESS',
            ntsConfirmNum: `NTS-${Math.floor(Math.random() * 100000000)}`,
            message: '국세청 신고 및 임차인 이메일 발송 완료'
        }));

        console.log('[Popbill Mock API] 발행 완료:', results);

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('[Popbill API Error]', error);
        return NextResponse.json({ error: '세금계산서 발행 처리 중 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
