"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Building2, Zap, Shield, BarChart3, MessageSquare, CreditCard, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900">Nabido</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 items-center">
                        <div className="relative group">
                            <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-6">기능 소개</Link>
                            {/* Dropdown Menu */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-56 bg-white rounded-xl shadow-2xl border border-neutral-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                                <Link href="#feature-kakao" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">카카오톡 일일 브리핑</Link>
                                <Link href="#feature-match" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">AI 수납 자동 확인</Link>
                                <Link href="#feature-tax" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">세금계산서 원클릭 자동 발행</Link>
                                <Link href="#feature-unpaid" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">미납자 알림 자동 관리</Link>
                                <Link href="#feature-portal" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">스마트 임차인 포털 & 카드결제</Link>
                                <Link href="#feature-contract" className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">100% 무료 스마트 전자계약</Link>
                            </div>
                        </div>
                        <Link href="/pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-2">요금 안내</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95">대시보드로 가기</Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">로그인</Link>
                                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95">무료로 시작하기</Link>
                            </>
                        )}
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
                            통장 입금 내역 확인, 세금계산서 발행, 미수금 독촉까지. 매일 반복되던 업무를 'Nap do'가 완벽하게 자동화합니다.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group">
                                {user ? "대시보드로 가기" : "지금 바로 체험하기"}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="mt-16 sm:mt-24 mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/60 relative animate-in zoom-in-95 fade-in duration-1000 delay-500 bg-black">
                            {/* Dashboard Mockup Image */}
                            <img src="/images/napdo_royal_blue_hero_1771798110526.png" alt="Nabido 대시보드" className="w-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
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

                        <div className="space-y-32">
                            {/* Feature 1: KakaoTalk Messages */}
                            <div id="feature-kakao" className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        매일 아침 9시,<br />
                                        <span className="text-yellow-600">내 전담 비서의 카카오톡 브리핑</span>
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        간밤에 들어온 월세 내역, 오늘 돌아오는 만기 계약 등 주요 현황을 구글 제미나이(Gemini) 기반의 AI 비서가 분석하여 매일 아침 카카오톡 알림톡으로 정중하게 요약 보고합니다.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> Vercel Cron 기반 무인 스케줄러</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 카카오 알림톡 공식 API 연동</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl skew-y-2 transform transition-transform hover:skew-y-0 duration-500">
                                        <img src="/images/ai_daily_briefing_demo_1771560126369.webp" alt="AI 일일 브리핑" className="w-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2: Auto Match */}
                            <div id="feature-match" className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        매일 통장 앱을 열지 마세요.<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI가 안전하게 입금 내역을 확인</span>합니다.
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        당신의 통장 내역, 절대 유출되거나 조작되지 않습니다. 오픈뱅킹 공식 <b>읽기 전용(Read-Only)</b>망을 사용하여 오로지 '조회'만 수행합니다. 어떠한 경우에도 시스템이 자금을 이체하거나 출금할 수 없으며, 군사급(AES-256) 암호화로 철통 보안합니다.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 출금이 원천 차단된 Read-Only 데이터 연동</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 은행권 수준의 군사급(AES-256) 암호화 보관</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-2xl -skew-y-2 transform transition-transform hover:skew-y-0 duration-500">
                                        <img src="/images/payments_after_matching_1771544245501.png" alt="AI 통장 매칭" className="w-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3: Tax Invoice */}
                            <div id="feature-tax" className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        수납 확인 즉시,<br />
                                        <span className="text-emerald-600">세금계산서가 자동 발행</span>됩니다.
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        입금이 확인되는 그 순간, 홈택스(국세청)와 직결된 팝빌 API를 통해 임차인에게 합법적인 전자세금계산서가 원클릭으로 발행됩니다. 부가세 신고 스트레스를 날려버리세요.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 국세청(NTS) 100% 호환</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 종량제 기반 합리적 비용</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl skew-y-2 transform transition-transform hover:skew-y-0 duration-500">
                                        <img src="/images/full_page_success_check_1771558420799.png" alt="세금계산서 발행" className="w-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4: Delinquent Tenant Management */}
                            <div id="feature-unpaid" className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        감정 소모 없는<br />
                                        <span className="text-red-500">미납자 자동 관리 및 독촉</span>
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        악성 연체자와 더 이상 얼굴 붉히지 마세요. 납부일이 지나면 AI가 미납 내역을 파악하여 임차인에게 카카오톡 알림톡으로 정중하지만 단호한 안내 메시지를 자동으로 발송합니다.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 개인화된 미납자 알림톡 초안 자동 생성</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 연체일 척도 기반 체계적 프로세스</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-2xl -skew-y-2 transform transition-transform hover:skew-y-0 duration-500">
                                        <img src="/images/ai_generated_messages_1771557281851.png" alt="미납자 자동 관리" className="w-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 5: Tenant Portal */}
                            <div id="feature-portal" className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                        <CreditCard size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        임차인도 행복한 관리.<br />
                                        <span className="text-indigo-600">스마트 마이페이지 & 카드 결제</span>
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        임차인은 귀찮은 회원가입이나 앱 설치 없이, 카카오톡 <b>매직 링크</b> 하나로 본인의 영수증을 확인합니다. 현금이 없을 땐 토스페이/신용카드 무이자 할부로 월세를 낼 수 있습니다.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 영수증 엑셀 다운로드 포털</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 토스페이먼츠(PG) 즉시 연동</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-8 border-neutral-900/5 bg-neutral-900 p-2 max-w-sm mx-auto">
                                        <img src="/images/tenant_portal_top_1771741829583.png" alt="임차인 카드 납부" className="w-full object-contain rounded-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 6: E-Signature */}
                            <div id="feature-contract" className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 scroll-mt-32">
                                <div className="flex-1 space-y-6">
                                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                                        <Shield size={32} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                                        비싼 전자계약 솔루션은 끝.<br />
                                        <span className="text-rose-600">100% 무료 공인 스마트 계약</span>
                                    </h3>
                                    <p className="text-lg text-neutral-500 leading-relaxed">
                                        고비용의 상용 API 대신, 자체 구축한 HTML5 캔버스 서명 패드로 임대차 계약서를 갱신하세요. 스마트폰만 있으면 즉시 서명되고, 안전한 타임스탬프와 함께 위변조 불가능한 상태로 보관됩니다.
                                    </p>
                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 건당 무제한 무료 서명 패드</li>
                                        <li className="flex items-center gap-3 text-neutral-700 font-medium"><CheckCircle2 className="text-emerald-500" size={20} /> 계약서 원본 PDF 즉시 발급</li>
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-2xl skew-y-2 transform transition-transform hover:skew-y-0 duration-500">
                                        <img src="/images/electronic_signature_success_1771743017745.png" alt="스마트 전자계약" className="w-full object-cover" />
                                    </div>
                                </div>
                            </div>
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
                <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
                    <p>© 2026 Nabido. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/terms" className="hover:text-neutral-900 transition-colors">이용약관</Link>
                        <Link href="/privacy" className="hover:text-neutral-900 transition-colors">개인정보 처리방침</Link>
                        <a href="mailto:support@napdo.co.kr" className="hover:text-neutral-900 transition-colors">고객지원</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
