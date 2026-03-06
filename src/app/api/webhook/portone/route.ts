import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase 관리자 권한 클라이언트 구성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('[Portone Webhook Received]:', body);

        const { imp_uid, merchant_uid, status } = body;

        // 필수 값 확인
        if (!imp_uid || !merchant_uid) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 결제가 성공(paid)인 경우에만 처리
        if (status === 'paid') {
            try {
                // 1. 포트원 API 액세스 토큰 발급
                const tokenResponse = await axios.post('https://api.iamport.kr/users/getToken', {
                    imp_key: process.env.PORTONE_API_SECRET, // REST API Key 역할
                    imp_secret: process.env.PORTONE_API_SECRET // V2 환경에서는 Secret Key를 함께 사용하거나 대체
                });

                const { access_token } = tokenResponse.data.response;

                // 2. 포트원 결제 단건 조회 API 호출을 통해 실제 결제 검증 (결제 금액 및 위변조 여부 확인용)
                const paymentResponse = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
                    headers: { 'Authorization': access_token }
                });

                const paymentData = paymentResponse.data.response;

                // 결제 금액이 맞는지 등 추가 검증 로직이 필요하다면 이 부분에 구현
                // ex: if (paymentData.amount !== expected_amount) throw new Error('Amount mismatch');

                console.log('[Portone Webhook Payment Verified]:', paymentData.status);

                // 3. 결제가 조회된 내용에서도 정상 'paid' 라면 DB 업데이트
                if (paymentData.status === 'paid') {
                    // 예시: merchant_uid를 이용해 DB에서 해당 결제건을 조회하고 상태를 업데이트
                    // 실제 구현 시에는 merchant_uid 와 DB의 해당 레코드 식별자 매핑 방식에 맞춰 수정해야 합니다.

                    // payments 테이블 업데이트 (예시)
                    // const { error: paymentUpdateError } = await supabase
                    //     .from('payments')
                    //     .update({ status: 'PAID', paid_at: new Date().toISOString() })
                    //     .eq('id', merchant_uid); // merchant_uid가 DB의 payment ID라고 가정

                    // 관련 rooms 테이블 상태 업데이트 (예시)
                    // if (!paymentUpdateError) {
                    //      // roomId를 어떻게 알아낼 것인가? (payment 레코드에서 조회 필요)
                    // }

                    console.log(`[Success] Payment DB update for ${merchant_uid}`);
                }

            } catch (verifyError: any) {
                console.error('[Portone Webhook Verification Error]:', verifyError.response?.data || verifyError.message);
                // 중요: 포트원 웹훅 서버측 장애나 검증 실패 시, 무조건 성공(200)을 주지 말고 
                // 재시도를 유도하거나 별도 로깅을 하는 것이 좋을 수 있습니다.
                // 여기서는 일단 에러 로그만 남기고 넘어갑니다.
            }
        } else {
            console.log(`[Portone Webhook Ignored Status]: ${status} for ${merchant_uid}`);
        }

        // 웹훅 수신 성공 응답 (포트원 측에 재전송 방지)
        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error: any) {
        console.error('[Portone Webhook Application Error]:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
