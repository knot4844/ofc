---
description: Vercel + Next.js App Router 프로젝트의 베스트 프랙티스
---

# Vercel & React Best Practices

이 프로젝트는 **Next.js 16 App Router + Vercel 배포** 구조입니다.
코드를 작성하거나 수정할 때 아래 규칙을 반드시 따르세요.

---

## 1. Server vs Client Component 구분

- **기본값은 Server Component**입니다. `"use client"`를 습관적으로 붙이지 마세요.
- `"use client"`는 아래 경우에만 붙입니다:
  - `useState`, `useEffect`, `useContext` 등 React 훅 사용 시
  - 브라우저 이벤트 핸들러(`onClick`, `onChange` 등) 사용 시
  - `localStorage`, `window`, `document` 접근 시
- 데이터 fetch는 Server Component에서 직접 `async/await`으로 처리하세요.

```tsx
// ✅ 좋은 예 (Server Component)
export default async function RoomsPage() {
  const rooms = await fetchRooms(); // 서버에서 직접 fetch
  return <RoomList rooms={rooms} />;
}

// ❌ 나쁜 예 (불필요한 use client)
"use client";
export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  useEffect(() => { fetch('/api/rooms').then(...) }, []);
}
```

---

## 2. API Routes (Route Handlers)

- API 파일은 반드시 `src/app/api/[name]/route.ts` 경로에 위치합니다.
- 응답은 `NextResponse.json()`을 사용하세요.
- 에러 처리를 항상 포함하세요.

```ts
// ✅ 올바른 API Route 구조
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ... 로직
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
```

---

## 3. Vercel Cron Jobs

- Cron 설정은 `vercel.json`에서 관리합니다.
- Cron API Route는 반드시 `GET` 메서드로 정의하세요.
- 인증 헤더(`CRON_SECRET`)로 보호하세요.

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/daily-briefing", "schedule": "0 0 * * *" }
  ]
}
```

---

## 4. 환경변수

- 브라우저에서 접근 가능해야 하는 변수만 `NEXT_PUBLIC_` 접두사를 붙입니다.
- API 키 등 민감한 정보는 절대 `NEXT_PUBLIC_`을 붙이지 마세요.
- `.env.local`에 작성, `.gitignore`에 포함 확인.

```
# ✅ 서버 전용 (안전)
GEMINI_API_KEY=...
POPBILL_SECRET=...

# ⚠️ 클라이언트 노출 (Supabase anon key는 RLS로 보호)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 5. Supabase 사용 규칙

- 클라이언트 인스턴스는 `src/lib/supabase.ts`에서 가져옵니다.
- RLS(Row Level Security)가 활성화되어 있으므로, 항상 로그인된 사용자 컨텍스트에서 쿼리합니다.
- 서버 컴포넌트에서는 `createServerClient`를 사용하세요 (현재 anon client 사용 중 → 추후 개선).

---

## 6. 성능 최적화

- 이미지는 `next/image`의 `<Image>` 컴포넌트를 사용합니다.
- 링크는 `next/link`의 `<Link>` 컴포넌트를 사용합니다.
- 무거운 컴포넌트는 `dynamic` import로 지연 로딩합니다.

```tsx
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), { ssr: false });
```

---

## 7. TypeScript 규칙

- `any` 타입 사용을 금지합니다. 불가피할 경우 `unknown` 후 타입 가드 사용.
- 컴포넌트 props는 반드시 `interface`로 정의합니다.
- API 응답 타입은 `src/lib/data.ts`에 중앙 관리합니다.
