"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const handleAuth = async () => {
            // 1. PKCE Flow (Email confirmation link uses ?code=...)
            const url = new URL(window.location.href);
            const code = url.searchParams.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error("Auth callback exchange error:", error);
                    if (mounted) router.push("/login?error=" + encodeURIComponent("로그인 처리 중 오류가 발생했습니다."));
                    return;
                }
            }

            // 2. Session Check
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                if (mounted) router.push("/login?error=" + encodeURIComponent(error.message));
                return;
            }

            if (session) {
                const role = session.user?.user_metadata?.role;
                if (mounted) {
                    if (role === 'TENANT') {
                        router.push("/tenant-portal");
                    } else {
                        router.push("/dashboard");
                    }
                }
            }
        };

        // 해시 프래그먼트나 onAuthStateChange 등 지연 로딩을 대비하기 위한 리스너
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const role = session.user?.user_metadata?.role;
                if (mounted) {
                    if (role === 'TENANT') {
                        router.push("/tenant-portal");
                    } else {
                        router.push("/dashboard");
                    }
                }
            }
        });

        handleAuth();

        const timeoutId = setTimeout(() => {
            if (mounted) {
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (!session) router.push("/login?error=" + encodeURIComponent("로그인 세션 만료. 다시 로그인해주세요."));
                });
            }
        }, 3000);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-neutral-50">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-neutral-600 font-medium">로그인 처리 중...</p>
        </div>
    );
}
