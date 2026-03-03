"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleDemoLogin } from "@/components/providers/AuthProvider";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<"password" | "magic">("password");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push("/dashboard");
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            setMessage({ type: 'success', text: '로그인 링크가 발송되었습니다. 메일함을 확인해주세요!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: `${provider} 로그인 중 오류가 발생했습니다.` });
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-col items-center">
                    <Link href="/" className="flex flex-col items-center group">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform -rotate-6 group-hover:rotate-0 transition-transform">
                            <span className="text-white font-black text-2xl tracking-tighter">DW</span>
                        </div>
                        <h2 className="text-center text-3xl font-extrabold text-neutral-900 tracking-tight group-hover:text-blue-600 transition-colors">
                            Nabido
                        </h2>
                    </Link>
                    <p className="mt-2 text-center text-sm text-neutral-600">
                        임대업 1인 기업을 위한 완벽한 무인화 솔루션
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-neutral-100">

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* 소셜 로그인 */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialLogin('kakao')}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-neutral-900 bg-[#FEE500] hover:bg-[#FEE500]/90 transition-colors"
                        >
                            카카오톡으로 3초 만에 시작하기
                        </button>
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-xl shadow-sm text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                        >
                            Google 계정으로 계속하기
                        </button>
                    </div>

                    <div className="my-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-neutral-500">또는 이메일로 로그인</span>
                            </div>
                        </div>
                    </div>

                    {/* 로그인 탭 */}
                    <div className="flex rounded-xl border border-neutral-200 overflow-hidden mb-5">
                        <button
                            onClick={() => { setMode("password"); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === "password" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
                        >
                            비밀번호 로그인
                        </button>
                        <button
                            onClick={() => { setMode("magic"); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === "magic" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}
                        >
                            이메일 링크
                        </button>
                    </div>

                    {mode === "password" ? (
                        <form className="space-y-4" onSubmit={handlePasswordLogin}>
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-xl py-3 border focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="이메일 주소"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 sm:text-sm border-neutral-300 rounded-xl py-3 border focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="비밀번호"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? '로그인 중...' : (
                                    <>
                                        로그인
                                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleMagicLink}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-neutral-300 rounded-xl py-3 border"
                                    placeholder="이메일 주소"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? '메일 전송 중...' : (
                                    <>
                                        이메일 매직링크 받기
                                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-neutral-100">
                        <button
                            onClick={() => toggleDemoLogin(true)}
                            className="w-full flex justify-center items-center py-4 px-4 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-blue-700 font-bold transition-all group shadow-sm"
                        >
                            🚀 데모 환경 체험하기 (비회원 로그인)
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
