import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 포트원 웹훅 페이로드 검증 및 처리 로직
        // https://developers.portone.io/docs/ko/result/webhook 참조
        console.log('[Portone Webhook Received]:', body);

        // TODO: 포트원 단건 조회 API를 호출하여 실제 결제 상태를 확인하고,
        // DB(supabase)의 payments, rooms 상태를 업데이트합니다.

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error: any) {
        console.error('[Portone Webhook Error]:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
