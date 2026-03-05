"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Users, CreditCard, Bell, Settings, ChevronDown, Building2, FileText, BarChart3 } from "lucide-react";
import { useBusiness } from "@/components/providers/BusinessProvider";

export function Sidebar() {
    const { currentBusiness, allBusinesses, setSelectedBusinessId, selectedBusinessId } = useBusiness();
    const pathname = usePathname();

    const isActive = (path: string, exact = false) => {
        if (exact) return pathname === path;
        return pathname?.startsWith(path);
    };

    const mainNavItems = [
        { href: "/dashboard", label: "대시보드", icon: Home, exact: true },
        { href: "/tenants", label: "호실 및 임차인 관리", icon: Users },
        { href: "/payments", label: "정산 및 수납 (계좌연동)", icon: CreditCard },
        { href: "/billing", label: "정기 청구 자동화", icon: Bell },
        { href: "/invoices", label: "세금계산서 일괄발행", icon: FileText },
        { href: "/reports", label: "재무 및 통계 보고서", icon: BarChart3, dividerTop: true },
    ];

    return (
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 px-4 py-6 flex-col z-50">
            {/* Global Logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 px-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
                    <Building2 size={20} className="text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">noado</span>
            </Link>
            <div className="relative group mb-10 w-full">
                <button className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-xl transition-colors text-left border border-transparent hover:border-neutral-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {currentBusiness ? currentBusiness.name.charAt(0) : "전"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-sm font-bold tracking-tight text-neutral-900 truncate">
                                {currentBusiness ? currentBusiness.name : "전체 사업장"}
                            </span>
                            <span className="block text-xs text-neutral-500 truncate mt-0.5">
                                {currentBusiness ? currentBusiness.ownerName : "통합 관리"}
                            </span>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-neutral-400 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                        onClick={() => setSelectedBusinessId("ALL")}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors ${selectedBusinessId === "ALL" ? "text-blue-700 bg-blue-50/50 font-bold" : "text-neutral-700 font-medium"}`}
                    >
                        <Building2 size={16} className={selectedBusinessId === "ALL" ? "text-blue-600" : "text-neutral-400"} />
                        전체 사업장 보기
                    </button>
                    <div className="h-px bg-neutral-100"></div>
                    {allBusinesses.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => setSelectedBusinessId(b.id)}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors ${selectedBusinessId === b.id ? "text-blue-700 bg-blue-50/50 font-bold" : "text-neutral-700"}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${selectedBusinessId === b.id ? "bg-blue-600" : "bg-neutral-300"}`}></span>
                            {b.name}
                        </button>
                    ))}
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {mainNavItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.dividerTop ? 'border-t border-neutral-100 pt-3 mt-1' : ''} ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                            <item.icon size={20} className={active ? "text-blue-600" : ""} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <Link href="/pricing" className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors border-t mt-2 ${isActive("/pricing") ? "bg-gradient-to-r from-blue-100 to-blue-50/50 border-blue-200 text-blue-700 font-bold" : "bg-gradient-to-r from-blue-50/50 to-transparent border-blue-100 text-blue-600 hover:bg-blue-50"}`}>
                    <div className="flex items-center gap-3 font-bold">
                        <CreditCard size={20} />
                        <span>SaaS 요금제 구독</span>
                    </div>
                </Link>
            </nav>

            <div className="mt-auto border-t border-neutral-200 pt-4">
                <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive("/settings") ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}>
                    <Settings size={20} className={isActive("/settings") ? "text-blue-600" : ""} />
                    <span>설정</span>
                </Link>
            </div>
        </aside>
    );
}
