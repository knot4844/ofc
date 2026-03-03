/**
 * Solapi SDK를 사용한 카카오 알림톡 발송 유틸리티
 * 채널: @대우오피스
 * 템플릿 코드: DAILY_BRIEFING_001 / UNPAID_REMINDER_001 / PAYMENT_COMPLETE_001
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SolapiMessageService = require('solapi').default ?? require('solapi');

const apiKey = process.env.SOLAPI_API_KEY!;
const apiSecret = process.env.SOLAPI_API_SECRET!;
const channelId = process.env.SOLAPI_CHANNEL_ID!; // pf로 시작하는 채널 pfId

interface AlimtalkPayload {
    to: string; // 수신자 전화번호 (예: '01012345678')
    templateCode: string;
    variables: Record<string, string>;
}

export async function sendKakaoAlimtalk(payload: AlimtalkPayload): Promise<boolean> {
    const { to, templateCode, variables } = payload;

    // 채널 ID가 없으면 Mock 로그만 출력 (심사 완료 전)
    if (!channelId) {
        console.log(`\n[MOCK] 알림톡 발송 (채널 ID 미설정)`);
        console.log(`To: ${to} | Template: ${templateCode}`);
        console.log(`Variables:`, variables);
        return true;
    }

    // 실제 발송
    if (!apiKey || !apiSecret) {
        console.error('SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 설정되지 않았습니다.');
        return false;
    }

    try {
        const messageService = new SolapiMessageService(apiKey, apiSecret);

        await messageService.send({
            to,
            kakaoOptions: {
                pfId: channelId,
                templateId: templateCode,
                variables,
            },
        });

        console.log(`✅ 알림톡 발송 성공: ${to} / ${templateCode}`);
        return true;
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error(`❌ 알림톡 발송 실패: ${err.message}`);
        return false;
    }
}
