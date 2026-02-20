"use client";

import React, { useState } from "react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { RefreshCw, CheckCircle2, AlertTriangle, FileText, ArrowRightLeft } from "lucide-react";

export default function PaymentsPage() {
    const { selectedBusinessId, currentBusiness, getRoomsByBusiness } = useBusiness();
    const rooms = getRoomsByBusiness(selectedBusinessId).filter(r => r.status !== "VACANT");

    // Mock incoming bank transactions
    const [transactions, setTransactions] = useState([
        { id: "tx_1", date: "2023-10-25", amount: 550000, depositor: "김밥천국", status: "UNMATCHED" },
        { id: "tx_2", date: "2023-10-25", amount: 850000, depositor: "홍길동", status: "UNMATCHED" }, // Name mismatch
        { id: "tx_3", date: "2023-10-24", amount: 2000000, depositor: "장수약국", status: "UNMATCHED" },
        { id: "tx_4", date: "2023-10-24", amount: 850000, depositor: "임차인_238호", status: "UNMATCHED" },
    ]);

    const [isSyncing, setIsSyncing] = useState(false);
    const [isMatching, setIsMatching] = useState(false);

    const [isIssuingTax, setIsIssuingTax] = useState(false);
    const [taxResults, setTaxResults] = useState<any[]>([]);

    const handleSyncBank = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    const handleAutoMatch = async () => {
        setIsMatching(true);

        // 1. Simulate AI Matching First
        await new Promise(resolve => setTimeout(resolve, 2000));

        let matchedTransactions: any[] = [];

        setTransactions(prev => prev.map(t => {
            if (t.depositor === "김밥천국" || t.depositor === "장수약국" || t.depositor === "임차인_238호") {
                const matched = { ...t, status: "MATCHED" };
                matchedTransactions.push(matched);
                return matched;
            }
            return t;
        }));

        setIsMatching(false);

        // 2. Zero-Touch: Automatically Issue Tax Invoices for Matched Items
        if (matchedTransactions.length > 0) {
            setIsIssuingTax(true);
            try {
                const res = await fetch('/api/popbill/issue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payments: matchedTransactions }),
                });
                const data = await res.json();
                if (data.success) {
                    setTaxResults(data.results);
                }
            } catch (err) {
                console.error("Popbill API failed", err);
            } finally {
                setIsIssuingTax(false);
            }
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative">

            {/* Popbill Issuance Overlay */}
            {(isIssuingTax || taxResults.length > 0) && (
                <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            {isIssuingTax ? (
                                <>
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <FileText size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">세금계산서 자동 발행 중...</h3>
                                    <p className="text-sm text-neutral-500">
                                        팝빌(Popbill) API를 통해 국세청 전송 및<br />임차인 이메일 발송 작업을 수행하고 있습니다.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Zero-Touch 통장 매칭 및 발행 완료!</h3>
                                    <p className="text-sm text-neutral-500 mb-6">
                                        결제가 확인된 {taxResults.length}건의 세금계산서가 완벽하게 처리되었습니다.
                                    </p>

                                    <div className="bg-neutral-50 rounded-xl p-4 text-left space-y-3 mb-6 max-h-48 overflow-y-auto">
                                        {taxResults.map(r => (
                                            <div key={r.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                                                <div>
                                                    <p className="font-bold text-sm text-neutral-900">{r.depositor}</p>
                                                    <p className="text-xs text-neutral-500">{r.ntsConfirmNum}</p>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">발행/전송 성공</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setTaxResults([])}
                                        className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors"
                                    >
                                        내역 닫기
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">수납 자동 매칭 (통장 연동)</h1>
                    <p className="text-neutral-500 mt-1">
                        은행 계좌 입금 내역을 가져와 임차인의 미납 내역과 자동으로 매칭합니다.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSyncBank}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                        <RefreshCw size={18} className={isSyncing ? "animate-spin text-blue-600" : ""} />
                        계좌 내역 불러오기
                    </button>
                    <button
                        onClick={handleAutoMatch}
                        disabled={isMatching || transactions.every(t => t.status === "MATCHED")}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:bg-neutral-300 disabled:cursor-not-allowed"
                    >
                        {isMatching ? "매칭 분석 중..." : "AI 수납 자동 매칭"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                {/* Bank Transactions Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-neutral-700 font-bold">
                            <ArrowRightLeft size={18} className="text-blue-600" />
                            최근 입금 내역 (계좌)
                        </div>
                        <span className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded text-neutral-500 font-medium">연동: 신한은행 110-123-****</span>
                    </div>

                    <div className="divide-y divide-neutral-100 overflow-y-auto flex-1 p-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className={`p-4 rounded-lg my-1 transition-all flex items-center justify-between ${tx.status === "MATCHED"
                                ? "bg-emerald-50 border border-emerald-100"
                                : "bg-white hover:bg-neutral-50 border border-transparent"
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-xs">
                                        {tx.date.split("-")[2]}일
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900">{tx.depositor} <span className="text-xs font-normal text-neutral-400 ml-1">입금</span></div>
                                        <div className="text-xs text-neutral-500">{tx.date}</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-blue-700">+ ₩ {tx.amount.toLocaleString()}</div>
                                    {tx.status === "MATCHED" ? (
                                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1 mt-1">
                                            <CheckCircle2 size={12} /> 매칭 완료
                                        </span>
                                    ) : (
                                        <span className="text-xs text-rose-500 font-medium flex items-center justify-end gap-1 mt-1">
                                            <AlertTriangle size={12} /> 매칭 대기
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outstanding Invoices Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-neutral-700 font-bold">
                            <FileText size={18} className="text-rose-500" />
                            당월 청구 / 미수금 현황
                        </div>
                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold">{rooms.filter(r => r.status === "UNPAID").length}건 미납</span>
                    </div>

                    <div className="divide-y divide-neutral-100 overflow-y-auto flex-1 p-2">
                        {rooms.map(room => {
                            // Find if there's a successful match for visual feedback
                            const isRecentlyMatched = transactions.find(t => t.status === "MATCHED" && t.depositor === room.tenant?.name);

                            return (
                                <div key={room.id} className={`p-4 rounded-lg my-1 transition-all flex items-center justify-between ${isRecentlyMatched
                                    ? "bg-emerald-50 border border-emerald-200"
                                    : room.status === "UNPAID"
                                        ? "bg-rose-50 border border-rose-200"
                                        : "bg-white border border-neutral-100"
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 text-center text-xs font-bold text-neutral-500 bg-neutral-100 py-1 rounded">
                                            {room.name}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900">{room.tenant?.name}</div>
                                            <div className="text-xs text-neutral-500">청구일: {room.paymentInfo?.dueDate}</div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`font-bold ${isRecentlyMatched ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                                            ₩ {room.paymentInfo?.monthlyRent.toLocaleString()}
                                        </div>

                                        {isRecentlyMatched ? (
                                            <span className="text-xs text-emerald-600 font-bold mt-1 block">수납 완료 처리됨</span>
                                        ) : room.status === "UNPAID" ? (
                                            <button className="text-[10px] bg-rose-600 text-white px-2 py-1 rounded font-bold mt-1 hover:bg-rose-700 transition-colors">
                                                수동 수납처리
                                            </button>
                                        ) : (
                                            <span className="text-xs text-neutral-400 font-medium mt-1 block">수납 완료</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
