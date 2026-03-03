
# Nabido — 임대관리 자동화 플랫폼

> 소규모 임대사업자를 위한 AI 기반 무인화 임대 관리 솔루션

---

## 🎯 서비스 개요

2.5평 규모의 소형 사무실·원룸·상가를 운영하는 임대사업자를 위한 맞춤형 자동화 관리 솔루션.  
수기 관리의 번거로움(임대료 확인, 세금계산서, 세금 신고, 독촉 문자)을 해결하고,  
소규모 임대 사업자들도 쉽게 쓸 수 있는 **SaaS** 형태로 수익화를 목표로 합니다.

---

## 👥 타겟 유저

- 소규모 공유오피스, 원룸, 상가 임대 사업자 (10~50호실 규모)
- 엑셀·수기로 복잡한 정산을 처리하는 것이 힘든 사업자

---

## 🎨 디자인 컨셉

- **미니멀 & 직관적 (Minimal & Intuitive)**
- 복잡한 회계 프로그램 느낌을 탈피, 애플·최신 SaaS처럼 여백을 살린 UI
- 핵심 정보(미납률, 이번 달 수입)만 대시보드에 노출
- 타이포그래피 중심 깔끔하고 모던한 디자인

---

## ⚙️ 핵심 기능

### ✅ 구현 완료

| 기능 | 설명 |
|------|------|
| **대시보드** | 전체 호실 현황, 미납 현황, 공실, 계약 만료 임박 알림 |
| **호실 & 임차인 관리** | 계약일/만료일/보증금/월세/부가세 관리, 호실별 상태 표시 |
| **수납 자동 매칭** | AI 기반 통장 입금 내역 ↔ 임차인 매칭 (시뮬레이션) |
| **세금계산서 발행** | 팝빌(Popbill) API 연동, 매칭 즉시 자동 발행 |
| **카카오 알림톡** | 미납자 자동 독촉, 일일 브리핑 발송 |
| **AI 일일 브리핑** | Gemini AI 기반 매일 아침 임대 현황 요약 |
| **AI 채팅** | 임대 관련 질문에 답하는 챗봇 |
| **시장 분석** | AI 기반 주변 시세 분석 위젯 |
| **전자계약** | HTML5 캔버스 서명 패드, PDF 계약서 발행 |
| **임차인 포털** | 매직 링크 로그인, 영수증 확인, 카드 결제 |
| **크론 자동화** | Vercel Cron - 일일 브리핑(09:00), 미납 알림(02:00) |
| **요금제 페이지** | Freemium / Basic / Pro 요금 안내 |
| **로그인** | 이메일 매직링크, 카카오, 구글, 데모 비회원 |

### 🚧 미구현 / 고도화 예정

| 기능 | 설명 |
|------|------|
| 오픈뱅킹 실계좌 연동 | 현재는 Mock 데이터, 실제 Open API 연동 필요 |
| 카카오 알림톡 사업자 계정 실연동 | 현재는 API 구조만 구현됨 |
| 분기별 부가세 / 종합소득세 엑셀 다운로드 | 세무 신고용 데이터 export |
| Google Drive 계약서 자동 백업 | 전자서명 완료 시 PDF 자동 저장 |
| SMS 자동 발송 | 알리고 / 솔루피아 API 연동 |

---

## 💰 수익화 모델

| 플랜 | 호실 수 | 가격 |
|------|---------|------|
| **Free** | 5호실 이하 | 무료 (체험용) |
| **Basic** | 10호실 이하 | 월 9,900원 |
| **Pro** | 50호실 이하 | 월 19,900원 (문자 발송비 실비 별도) |

---

## 🏗️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 인증 | Supabase Auth (이메일 매직링크, OAuth) |
| AI | Google Gemini API |
| 세금계산서 | 팝빌(Popbill) API |
| 결제 | 토스페이먼츠(TossPayments) |
| 배포 | Vercel (자동 Cron 포함) |
| 알림 | 카카오 알림톡 API |
| 차트 | Recharts |

---

## 🗄️ 사업장 구성 (데모 데이터)

| ID | 이름 | 호실 수 |
|----|------|---------|
| `b_daewoo` | 대우 고시원 | 30개 (201호~230호) |
| `b_royal` | 로얄 오피스텔 | 5개 (101호~105호) |
| `b_teheran` | 테헤란로상가 | 12개 (101호~112호) |

---

## 🚀 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

### DB 초기화 (최초 1회)

1. Supabase 대시보드 → SQL Editor에서 `supabase_schema.sql` 실행
2. 이어서 `supabase_rls_migration.sql` 실행 (RLS 보안 설정)
3. 마지막으로 `seed_real_db.sql` 실행 (데모 데이터 삽입)

또는 TypeScript seed 스크립트:
```bash
npx tsx scripts/seed_db.ts
```

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 랜딩 페이지
│   ├── dashboard/            # 대시보드
│   ├── rooms/                # 호실 관리
│   ├── tenants/              # 임차인 관리
│   ├── payments/             # 수납 매칭
│   ├── billing/              # 청구서
│   ├── invoices/             # 세금계산서
│   ├── contracts/            # 전자계약
│   ├── reports/              # 보고서
│   ├── settings/             # 설정
│   ├── portal/               # 임차인 포털
│   ├── pricing/              # 요금제
│   ├── login/                # 로그인
│   └── api/
│       ├── ai-assistant/     # AI 어시스턴트
│       ├── ai-chat-db/       # AI 채팅
│       ├── ai-market-analysis/ # 시장 분석
│       ├── ai-report/        # AI 리포트
│       ├── popbill/          # 세금계산서 발행
│       ├── admin/            # 마스터 관리자
│       └── cron/
│           ├── daily-briefing/   # 매일 09:00 브리핑
│           └── unpaid-reminders/ # 매일 02:00 미납 알림
├── components/
│   ├── dashboard/            # 대시보드 위젯들
│   ├── layout/               # 사이드바, 헤더
│   ├── payments/             # 수납 컴포넌트
│   ├── contracts/            # 계약서 컴포넌트
│   └── providers/            # Auth, Business Context
└── lib/
    ├── data.ts               # 타입 정의 & Mock 데이터
    ├── supabase.ts           # Supabase 클라이언트
    └── alimtalk.ts           # 카카오 알림톡 연동
```
