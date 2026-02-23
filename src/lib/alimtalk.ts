/**
 * Mock utility for sending Kakao Alimtalk messages.
 * In a real production environment, this would integrate with a service like
 * Popbill Alimtalk API, CoolSMS, or Solapi using their respective SDKs.
 */

interface AlimtalkPayload {
    to: string; // Phone number
    templateCode: string;
    variables: Record<string, string>;
}

export async function sendKakaoAlimtalk(payload: AlimtalkPayload): Promise<boolean> {
    const { to, templateCode, variables } = payload;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`\n========================================`);
    console.log(`📱 [KAKAO ALIMTALK DISPATCHED]`);
    console.log(`📞 To: ${to}`);
    console.log(`📝 Template: ${templateCode}`);
    console.log(`----------------------------------------`);

    let messageBody = "";

    switch (templateCode) {
        case "DAILY_BRIEFING_001":
            messageBody = `[Nabido]\n안녕하세요 ${variables.ownerName} 대표님,\n오늘의 AI 통합 현황 브리핑입니다.\n\n${variables.reportContent}\n\n자세한 내용은 대시보드에서 확인하세요.`;
            break;
        case "UNPAID_REMINDER_001":
            messageBody = `[Nabido]\n안녕하세요 ${variables.tenantName}님,\n${variables.roomName}의 임대료가 미납되어 안내드립니다.\n\n- 미납금액: ${variables.unpaidAmount}원\n\n조속한 납부 부탁드립니다.`;
            break;
        default:
            messageBody = `Template not found. Variables: ${JSON.stringify(variables)}`;
    }

    console.log(messageBody);
    console.log(`========================================\n`);

    // Always succeed in demo
    return true;
}
