"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleDemoLogin } from "@/components/providers/AuthProvider";

type Mode = "login" | "signup" | "magic";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const clearMsg = () => setMessage(null);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); clearMsg();
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push("/dashboard");
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : err.message });
        } finally { setLoading(false); }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); clearMsg();
        try {
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            });
            if (error) throw error;
            setMessage({ type: 'success', text: '가입 확인 이메일이 발송되었습니다. 메일함을 확인해주세요!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally { setLoading(false); }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); clearMsg();
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            setMessage({ type: 'success', text: '로그인 링크가 발송되었습니다. 메일함을 확인해주세요!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally { setLoading(false); }
    };

    const handleSocial = async (provider: 'google' | 'kakao') => {
        try {
            const options: Parameters<typeof supabase.auth.signInWithOAuth>[0]['options'] = {
                redirectTo: `${window.location.origin}/auth/callback`,
            };
            // KOE205 방지: 카카오는 scope를 명시적으로 지정해야 함
            if (provider === 'kakao') {
                options.queryParams = {
                    scope: 'profile_nickname profile_image account_email',
                };
            }
            await supabase.auth.signInWithOAuth({ provider, options });
        } catch {
            setMessage({ type: 'error', text: `${provider} 로그인 중 오류가 발생했습니다.` });
        }
    };

    const isSignup = mode === 'signup';
    const isMagic = mode === 'magic';

    return (
        <div className="absolute inset-0 z-50 bg-neutral-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex flex-col items-center group">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform -rotate-6 group-hover:rotate-0 transition-transform">
                        <span className="text-white font-black text-2xl tracking-tighter">DW</span>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-neutral-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        Nabido
                    </h2>
                </Link>
                <p className="mt-2 text-center text-sm text-neutral-500">임대업 1인 기업을 위한 완벽한 무인화 솔루션</p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-neutral-100">

                    {/* 소셜 로그인 */}
                    <div className="space-y-3">
                        <button onClick={() => handleSocial('kakao')} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-neutral-900 bg-[#FEE500] hover:bg-[#FEE500]/90 transition-colors">
                            카카오톡으로 3초 만에 시작하기
                        </button>
                        <button onClick={() => handleSocial('google')} className="w-full flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors">
                            Google 계정으로 계속하기
                        </button>
                    </div>

                    <div className="my-5">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-neutral-500">또는 이메일로</span></div>
                        </div>
                    </div>

                    {/* 탭: 로그인 / 회원가입 / 이메일링크 */}
                    <div className="flex rounded-xl border border-neutral-200 overflow-hidden mb-5 text-sm">
                        {([['login', '로그인', LogIn], ['signup', '회원가입', UserPlus], ['magic', '이메일 링크', Mail]] as const).map(([m, label, Icon]) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); clearMsg(); }}
                                className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition-colors ${mode === m ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                            >
                                <Icon size={14} />{label}
                            </button>
                        ))}
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {!isMagic ? (
                        <form className="space-y-4" onSubmit={isSignup ? handleSignup : handlePasswordLogin}>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-10 border border-neutral-300 rounded-xl py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="이메일 주소" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-10 pr-10 border border-neutral-300 rounded-xl py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder={isSignup ? "비밀번호 (8자 이상)" : "비밀번호"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button type="submit" disabled={loading || !email || !password} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-colors disabled:opacity-50 group">
                                {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
                                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleMagicLink}>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-10 border border-neutral-300 rounded-xl py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="이메일 주소" />
                            </div>
                            <button type="submit" disabled={loading || !email} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-colors disabled:opacity-50 group">
                                {loading ? '메일 전송 중...' : '이메일 매직링크 받기'}
                                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-neutral-100">
                        <button onClick={() => toggleDemoLogin(true)} className="w-full flex justify-center items-center py-4 px-4 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-blue-700 font-bold transition-all">
                            🚀 데모 환경 체험하기 (비회원 로그인)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
