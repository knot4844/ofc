"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Supabase가 URL hash에서 세션을 자동으로 처리함
        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                router.push("/login?error=" + encodeURIComponent(error.message));
                return;
            }

            if (session) {
                // 로그인 성공 → 대시보드로
                router.push("/dashboard");
            } else {
                // 세션이 없으면 URL hash에서 토큰 처리 대기 후 재시도
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        router.push("/dashboard");
                    } else {
                        router.push("/login");
                    }
                }, 1000);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-neutral-50">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-neutral-600 font-medium">로그인 처리 중...</p>
        </div>
    );
}
