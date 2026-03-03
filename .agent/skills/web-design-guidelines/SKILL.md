---
description: Nabido 서비스의 UI/UX 디자인 가이드라인 — 미니멀하고 직관적인 임대 관리 플랫폼
---

# Web Design Guidelines — Nabido

이 프로젝트의 디자인 컨셉은 **"미니멀 & 직관적 (Minimal & Intuitive)"**입니다.
새로운 페이지나 컴포넌트를 만들 때 아래 가이드를 반드시 따르세요.

---

## 1. 디자인 철학

- **복잡함을 숨기고, 핵심만 보여준다.** 불필요한 요소는 제거합니다.
- **애플·Notion·Linear** 같은 현대 SaaS 스타일을 참고합니다.
- 사용자가 한 화면에서 너무 많은 정보를 보지 않도록 합니다.
- 한글 텍스트 위주이므로 가독성을 최우선으로 합니다.

---

## 2. 색상 팔레트

### 주요 색상 (Tailwind 클래스 기준)

| 용도 | 클래스 | 사용처 |
|------|--------|--------|
| 브랜드 (파랑) | `blue-600` | 버튼, 링크, 강조 |
| 성공 / 납부완료 | `emerald-500` | 완납 상태, 성공 메시지 |
| 위험 / 미납 | `rose-500` | 미납 상태, 경고 |
| 공실 / 비어있음 | `neutral-300` | 공실 호실 |
| 만료 임박 | `orange-500` | 계약 만료 경고 |
| 배경 (기본) | `white` / `neutral-50` | 페이지, 카드 배경 |
| 텍스트 (강조) | `neutral-900` | 제목, 중요 숫자 |
| 텍스트 (보조) | `neutral-500` | 설명, 부제목 |
| 테두리 | `neutral-100` / `neutral-200` | 카드, 입력창 |

### 절대 사용 금지
- 순수 `red-`, `green-`, `blue-` (원색) 직접 사용 금지 → 반드시 채도 조절된 버전 사용

---

## 3. 컴포넌트 스타일 규칙

### 카드 (Card)
```tsx
// 표준 카드 스타일
<div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
```
- `rounded-2xl` 이상의 모서리 둥글기
- `shadow-sm` (과도한 그림자 금지)
- 내부 패딩 `p-6`

### 버튼
```tsx
// 주요 액션 버튼 (파랑)
<button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">

// 보조 버튼 (테두리)
<button className="px-6 py-3 border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors">

// 위험 액션 버튼 (빨강)
<button className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors">
```

### 입력 필드
```tsx
<input className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-neutral-50 focus:bg-white" />
```

### 상태 배지 (Badge)
```tsx
// 납부완료
<span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">납부완료</span>

// 미납
<span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">미납</span>

// 공실
<span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs font-bold rounded-full">공실</span>
```

---

## 4. 타이포그래피

```tsx
// 페이지 제목 (h1)
<h1 className="text-2xl font-bold text-neutral-900 tracking-tight">

// 섹션 제목 (h2)
<h2 className="text-lg font-bold text-neutral-900">

// 카드 제목 (h3)
<h3 className="text-sm font-medium text-neutral-500">

// 강조 숫자 (KPI)
<span className="text-3xl font-bold text-neutral-900">

// 보조 설명
<p className="text-sm text-neutral-500">
```

---

## 5. 레이아웃

- 페이지 최대 너비: `max-w-7xl mx-auto`
- 페이지 내부 패딩: `p-4 md:p-8`
- 섹션 간격: `space-y-8`
- 그리드: `grid grid-cols-1 md:grid-cols-3 gap-6`
- 페이지 진입 애니메이션: `animate-in fade-in duration-500` 항상 적용

---

## 6. 인터랙션 & 애니메이션

- 카드 호버: `hover:-translate-y-1 hover:shadow-md transition-all`
- 버튼 클릭: `active:scale-95 transition-all`
- 상태 전환: `transition-colors duration-200`
- 페이지 로딩: `animate-in fade-in slide-in-from-bottom-4 duration-500`
- **과도한 애니메이션 금지** — 실용적이고 빠른 느낌 유지

---

## 7. 아이콘

- 아이콘 라이브러리: **`lucide-react`** 만 사용합니다.
- 크기: 텍스트 옆 `size={16}`, 카드 내 `size={20}`, 강조 `size={24}`
- 색상은 부모 요소의 `text-*` 클래스로 제어합니다.

```tsx
import { Building2, Wallet, AlertCircle } from 'lucide-react';
```

---

## 8. 반응형 디자인

- **모바일 우선(Mobile First)** 으로 작성합니다.
- 주요 브레이크포인트: `sm` (640px), `md` (768px), `lg` (1024px)
- 모바일에서 숨겨야 할 요소: `hidden md:flex`
- 모바일 전용 스택: `flex-col md:flex-row`

---

## 9. 금지 사항

- ❌ 인라인 스타일 (`style={{}}`) 사용 금지 → Tailwind 클래스 사용
- ❌ 임의 색상값 (`#FF0000`) 사용 금지 → Tailwind 팔레트 사용
- ❌ `px` 단위 하드코딩 금지 → Tailwind spacing 사용
- ❌ 과도한 그림자 (`shadow-2xl` 남발) 금지
- ❌ 마케팅 페이지 제외한 일반 UI에 그라디언트 남발 금지
