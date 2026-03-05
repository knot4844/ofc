import * as dotenv from "dotenv";
import { resolve } from "path";

// 1. 가장 먼저 환경변수를 로드합니다. (Top level)
dotenv.config({ path: resolve(__dirname, "../.env.local") });

async function runTest() {
    // 2. 환경변수가 로드된 이후에 모듈을 동적으로 가져와야 모듈 내부의 최상단 process.env가 정상적으로 읽힙니다.
    const { sendKakaoAlimtalk } = await import("../src/lib/alimtalk");

    const targetNumber = process.argv[2];

    if (!targetNumber) {
        console.error("❌ 사용법: npx tsx scripts/test_alimtalk.ts [수신자_전화번호]");
        console.error("예시: npx tsx scripts/test_alimtalk.ts 01012345678");
        process.exit(1);
    }

    console.log(`\n🚀 [카카오 알림톡 테스트 발송 시작]`);
    console.log(`수신번호: ${targetNumber}`);

    // 일일 브리핑 템플릿 코드 또는 미납 안내 템플릿 사용 (사전에 등록되어 있는 것)
    // 등록된 모의 템플릿 파라미터로 발송 시도
    const success = await sendKakaoAlimtalk({
        to: targetNumber,
        templateCode: "KA01TP260302200441583wMOcyLIy71M",
        variables: {
            tenantName: "홍길동",
            roomName: "테스트 빌딩 101호",
            unpaidAmount: "800,000",
            unpaidMonths: "1",
            month: "3",
            amount: "800,000" // Adding some common variable names just in case
        }
    });

    if (success) {
        console.log(`\n✅ 테스트 알림톡 발송 성공! 스마트폰 카카오톡을 확인해 보세요.`);
    } else {
        console.log(`\n❌ 테스트 알림톡 발송 실패. (터미널 로그 또는 .env 설정을 확인해주세요)`);
    }
}

runTest();
