const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// 엑셀 파일 경로
const filePath = path.join('/Users/dyl/Downloads', '신한은행 거래내역.xlsx');

async function testExcelParse() {
    try {
        console.log(`파일 읽기 시도: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            console.error('파일이 존재하지 않습니다.');
            return;
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // JSON으로 변환 (배열 방식)
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`총 ${jsonData.length} 줄을 읽어왔습니다.`);

        // 앞 10줄만 출력하여 구조 확인
        console.log('--- 파일 구조 (상위 10줄) ---');
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            console.log(`[Row ${i}]`, JSON.stringify(jsonData[i]));
        }

    } catch (error) {
        console.error('엑셀 파싱 중 오류:', error);
    }
}

testExcelParse();
