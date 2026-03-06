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
            const url = new URL(window.location.href);
            const code = url.searchParams.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                // Even on error (e.g., Code Exchanged due to StrictMode), we proceed
                // and check if a session exists below.
            }

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error && mounted) {
                console.error("Auth callback session error:", error);
                router.push("/login?error=" + encodeURIComponent(error.message));
                return;
            }

            if (session && mounted) {
                const role = session.user?.user_metadata?.role;
                if (role === 'TENANT') {
                    router.push("/tenant-portal");
                } else {
                    router.push("/dashboard");
                }
            } else if (mounted) {
                // Not authenticated for some reason (maybe code invalid and no session)
                router.push("/login?error=" + encodeURIComponent("인증 처리 중 문제가 발생했습니다. (No Session)"));
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session && mounted) {
                const role = session.user?.user_metadata?.role;
                if (role === 'TENANT') {
                    router.push("/tenant-portal");
                } else {
                    router.push("/dashboard");
                }
            }
        });

        handleAuth();

        return () => {
            mounted = false;
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
