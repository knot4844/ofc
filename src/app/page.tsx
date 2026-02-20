"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Building2, Zap, Shield, BarChart3, MessageSquare, CreditCard, FileText } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && !isLoading) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) return null; // Let the layout loader handle it

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900">대우오피스 파트너스</span>
                    </div>
                    <nav className="hidden md:flex gap-8">
                        <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">기능 소개</Link>
                        <Link href="#automation" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">무인 자동화</Link>
                        <Link href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">요금 안내</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">로그인</Link>
                        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95">무료로 시작하기</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                            임대관리의 새로운 기준, AI 자동화 도입
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            복잡한 임대관리,<br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">이제 AI가 대신합니다.</span>
                        </h1>
                        <p className="text-xl text-neutral-500 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            통장 입금 내역 확인, 세금계산서 발행, 미수금 독촉까지. 매일 반복되던 업무를 '대우오피스 파트너스'가 완벽하게 자동화합니다.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group">
                                지금 바로 체험하기
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="mt-16 sm:mt-24 mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/60 relative animate-in zoom-in-95 fade-in duration-1000 delay-500">
                            {/* Dashboard Mockup Image. Needs generating */}
                            <div className="w-full h-[300px] md:h-[600px] bg-neutral-100 flex items-center justify-center flex-col gap-4 text-neutral-400">
                                🏙️ <br />
                                <span className="text-sm">대시보드 솔루션 스크린샷 이미지 영역</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-4">건물주를 위한 단 하나의 솔루션</h2>
                            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">수십 개의 엑셀 파일과 씨름하지 마세요. 모든 임대 관리 업무가 하나의 플랫폼에서 해결됩니다.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <CheckCircle2 className="text-emerald-500" size={24} />,
                                    title: "스마트한 수납 확인",
                                    desc: "통장 내역을 자동으로 불러와 동명이인까지 완벽하게 매칭하여 수납 처리를 완료합니다."
                                },
                                {
                                    icon: <FileText className="text-blue-500" size={24} />,
                                    title: "원클릭 세금계산서",
                                    desc: "국세청 홈택스 표준 포맷과 팝빌 API를 통해 수납 완료 건에 대한 세금계산서를 즉시 일괄 발행합니다."
                                },
                                {
                                    icon: <MessageSquare className="text-yellow-500" size={24} />,
                                    title: "카카오 알림톡 자동화",
                                    desc: "지연되는 미납금 안내, 임대료 청구서, 만기 안내까지 임차인에게 알림톡이 자동으로 발송됩니다."
                                },
                                {
                                    icon: <Shield className="text-indigo-500" size={24} />,
                                    title: "개별 접근 보안 (RLS)",
                                    desc: "오직 본인 소유의 건물과 호실 정보만 접근할 수 있는 완벽한 데이터 격리 보안을 제공합니다."
                                },
                                {
                                    icon: <Zap className="text-orange-500" size={24} />,
                                    title: "Zero-Touch 무인화",
                                    desc: "밤낮없이 백그라운드에서 스케줄러가 알아서 잔업을 처리합니다. 컴퓨터를 꺼두어도 작동합니다."
                                },
                                {
                                    icon: <BarChart3 className="text-purple-500" size={24} />,
                                    title: "AI 일일 브리핑",
                                    desc: "AI가 오늘의 미수금, 공실 현황 등을 파악하여 매일 아침 카카오톡으로 3줄 요약 보고서를 보냅니다."
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100 hover:shadow-md hover:bg-white transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                                    <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 bg-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            지금 바로 임대관리의 자유를 누리세요
                        </h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            복잡한 설정 없이 1분 만에 가입하고, 즉시 무료 데모 환경을 체험해 보실 수 있습니다.
                        </p>
                        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-xl">
                            시작하기 <ArrowRight size={20} />
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <Building2 size={24} />
                        <span className="font-bold text-xl tracking-tight">대우오피스 파트너스</span>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Daewoo Office Partners. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
