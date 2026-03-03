"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Building2, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface RoomInfo {
    roomId: string;
    roomName: string;
    businessName: string;
    tenantName: string;
    tenantEmail: string;
}

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!token) return;
        fetch(`/api/invite/validate?token=${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setError(data.error);
                else {
                    setRoomInfo(data);
                    setEmail(data.tenantEmail ?? "");
                }
            })
            .catch(() => setError("서버 오류가 발생했습니다."))
            .finally(() => setIsLoading(false));
    }, [token]);

    const handleKakaoLogin = async () => {
        setIsSending(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "kakao",
            options: {
                redirectTo: `${window.location.origin}/invite/${token}/profile`,
                scopes: "profile_nickname",
                queryParams: { scope: "profile_nickname" },
            },
        });
        if (error) setError(error.message);
        setIsSending(false);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/invite/${token}/profile`,
            },
        });
        if (error) setError(error.message);
        else setEmailSent(true);
        setIsSending(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center max-w-sm w-full">
                    <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">링크 오류</h2>
                    <p className="text-neutral-500 text-sm mb-6">{error}</p>
                    <Link href="/" className="text-blue-600 text-sm font-semibold hover:underline">홈으로 돌아가기</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-neutral-50 flex flex-col justify-center py-12 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 -rotate-6">
                        <span className="text-white font-black text-2xl tracking-tighter">DW</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">임대차 계약 초대</h1>
                    <p className="text-neutral-500 mt-2 text-sm">아래 정보를 확인하고 본인 인증 후 계약을 진행해주세요.</p>
                </div>

                {/* 호실 정보 카드 */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-neutral-900">{roomInfo?.businessName}</div>
                            <div className="text-sm text-neutral-500">{roomInfo?.roomName}</div>
                        </div>
                    </div>
                    {roomInfo?.tenantName && (
                        <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700">
                            초대된 임차인: <strong>{roomInfo.tenantName}</strong>
                        </div>
                    )}
                </div>

                {/* 가입 방법 선택 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    {emailSent ? (
                        <div className="text-center py-4">
                            <Mail className="mx-auto text-blue-600 mb-3" size={40} />
                            <h3 className="font-bold text-neutral-900 mb-2">이메일을 확인해주세요</h3>
                            <p className="text-sm text-neutral-500">
                                <strong>{email}</strong>로 로그인 링크를 보냈어요.<br />
                                링크를 클릭하면 기본정보 입력 페이지로 이동합니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-base font-bold text-neutral-800 mb-5 text-center">본인 인증 방법 선택</h2>

                            {/* 카카오 */}
                            <button
                                onClick={handleKakaoLogin}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-neutral-900 bg-[#FEE500] hover:bg-[#FEE500]/90 transition-colors mb-3"
                            >
                                카카오톡으로 시작하기
                            </button>

                            {/* 구분선 */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-neutral-400">또는 이메일로 시작</span>
                                </div>
                            </div>

                            {/* 이메일 */}
                            <form onSubmit={handleEmailLogin} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="이메일 주소 입력"
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !email}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {isSending ? "전송 중..." : "이메일 링크 받기"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-neutral-400 mt-6">
                    본인 인증 및 전자서명은 전자서명법에 따라 법적 효력이 있습니다.
                </p>
            </div>
        </div>
    );
}
