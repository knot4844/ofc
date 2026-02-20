import React from "react";
import { Copy, Save, AlertCircle, HelpCircle } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 border-b border-neutral-200 pb-4">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">환경 설정</h1>
                <p className="text-neutral-500 mt-1">사업자 정보 및 결제 연동 키를 관리합니다.</p>
            </header>

            <div className="space-y-6">

                {/* 1. 사업자 기본 정보 */}
                <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-neutral-900">내 사업자 정보</h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">필수</span>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">상호 (법인명)</label>
                                <input type="text" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="대우오피스 파트너스" defaultValue="대우오피스" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">대표자명</label>
                                <input type="text" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="홍길동" defaultValue="대표님" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">사업자등록번호</label>
                            <input type="text" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123-45-67890" defaultValue="120-81-45678" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">사업장 주소</label>
                            <input type="text" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="서울시 강남구 테헤란로 123" defaultValue="서울시 강남구 역삼동" />
                        </div>
                    </div>
                </section>

                {/* 2. 결제 및 세금계산서 (API 연동) */}
                <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-neutral-900">Zero-Touch 무인화 연동키</h2>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Pro 요금제 전용</span>
                    </div>

                    <div className="p-6 space-y-6">

                        {/* 팝빌 연동 */}
                        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-bold text-neutral-900 text-sm">팝빌 (Popbill) 세금계산서 API 설정</h3>
                                <HelpCircle size={16} className="text-neutral-400 cursor-help" />
                            </div>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                입금 매칭 시 세금계산서 자동 발행을 위해 팝빌 LinkID와 Secret Key가 필요합니다.
                                팝빌 파트너센터에서 발급받은 키를 입력해주세요.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">LinkID</label>
                                    <input type="text" className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono" placeholder="TESTER" defaultValue="TESTER" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">Secret Key</label>
                                    <input type="password" className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono" placeholder="SwWxqU+0TErBXy/9TVjIPEnI0NCqRoO0CEcZa21bM8i=" defaultValue="SwWxqU+0TErBXy/9TVjIPEnI0NCqRoO0CEcZa21bM8i=" />
                                </div>
                            </div>
                        </div>

                        {/* 오픈뱅킹 연동 (가상) */}
                        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                            <h3 className="font-bold text-neutral-900 text-sm mb-3">입금 확인 통장 설정</h3>
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">신한</div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">신한은행 110-123-****</p>
                                        <p className="text-xs text-neutral-500">정상 연동 중 (마지막 동기화: 1분 전)</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                    계좌 변경
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all group">
                        <Save size={18} />
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
