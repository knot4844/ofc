"use client";

import React, { useState } from "react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { CheckCircle2, AlertTriangle, Clock, CreditCard, TrendingDown } from "lucide-react";

type FilterStatus = "ALL" | "PAID" | "UNPAID";

export default function PaymentsPage() {
    const { selectedBusinessId, getPaymentsByBusiness, getRoomsByBusiness } = useBusiness();
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
    const [filterMonth, setFilterMonth] = useState<string>("");

    const allPayments = getPaymentsByBusiness(selectedBusinessId);
    const rooms = getRoomsByBusiness(selectedBusinessId);

    // 이용 가능한 월 목록 (중복 제거)
    const availableMonths = [...new Set(allPayments.map(p => p.month))].sort().reverse();

    // 필터 적용
    const filtered = allPayments.filter(p => {
        const statusMatch = filterStatus === "ALL" || p.status === filterStatus;
        const monthMatch = !filterMonth || p.month === filterMonth;
        return statusMatch && monthMatch;
    });

    // KPI 계산 (전체 또는 선택 월 기준)
    const basePayments = filterMonth ? allPayments.filter(p => p.month === filterMonth) : allPayments;
    const totalPaid = basePayments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
    const totalUnpaid = basePayments.filter(p => p.status === "UNPAID").reduce((s, p) => s + p.amount, 0);
    const unpaidCount = basePayments.filter(p => p.status === "UNPAID").length;
    const paidCount = basePayments.filter(p => p.status === "PAID").length;

    // 호실명 조회 헬퍼
    const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="mb-2">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">수납 현황</h1>
                <p className="text-neutral-500 mt-1">납부 이력 및 미납 현황을 확인합니다.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 mb-3">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-semibold">수납 완료</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">₩{totalPaid.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400 mt-1">{paidCount}건</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-600 mb-3">
                        <TrendingDown size={18} />
                        <span className="text-sm font-semibold">미수금</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">₩{totalUnpaid.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400 mt-1">{unpaidCount}건</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                        <CreditCard size={18} />
                        <span className="text-sm font-semibold">수납률</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">
                        {paidCount + unpaidCount > 0
                            ? Math.round((paidCount / (paidCount + unpaidCount)) * 100)
                            : 0}%
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">건수 기준</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 mb-3">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-semibold">미납 건수</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{unpaidCount}건</div>
                    <div className="text-xs text-neutral-400 mt-1">즉시 조치 필요</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-neutral-200">
                <div className="flex gap-2">
                    {(["ALL", "PAID", "UNPAID"] as FilterStatus[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filterStatus === s
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            {s === "ALL" ? "전체" : s === "PAID" ? "수납완료" : "미납"}
                        </button>
                    ))}
                </div>

                <select
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    className="ml-auto text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">전체 기간</option>
                    {availableMonths.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Payment Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-neutral-900">납부 이력</h2>
                    <span className="text-sm text-neutral-500">{filtered.length}건</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Clock size={32} className="text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-medium">
                            {allPayments.length === 0
                                ? "납부 데이터가 없습니다. Supabase SQL을 먼저 실행해주세요."
                                : "조건에 맞는 납부 내역이 없습니다."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr className="text-left text-neutral-500">
                                    <th className="px-6 py-3 font-medium">납부일</th>
                                    <th className="px-6 py-3 font-medium">호실</th>
                                    <th className="px-6 py-3 font-medium">임차인</th>
                                    <th className="px-6 py-3 font-medium">대상 월</th>
                                    <th className="px-6 py-3 font-medium text-right">금액</th>
                                    <th className="px-6 py-3 font-medium text-center">상태</th>
                                    <th className="px-6 py-3 font-medium">비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filtered.map(p => (
                                    <tr key={p.id} className={`hover:bg-neutral-50/70 transition-colors ${p.status === "UNPAID" ? "bg-rose-50/30" : ""}`}>
                                        <td className="px-6 py-3.5 text-neutral-600">{p.paidAt}</td>
                                        <td className="px-6 py-3.5 font-semibold text-neutral-800">{getRoomName(p.roomId)}</td>
                                        <td className="px-6 py-3.5 text-neutral-700">{p.tenantName}</td>
                                        <td className="px-6 py-3.5 text-neutral-500">{p.month}</td>
                                        <td className="px-6 py-3.5 text-right font-bold text-neutral-900">
                                            ₩{p.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            {p.status === "PAID" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                    <CheckCircle2 size={11} /> 완료
                                                </span>
                                            ) : p.status === "UNPAID" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                                                    <AlertTriangle size={11} /> 미납
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    부분
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-neutral-400 text-xs">{p.note ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
