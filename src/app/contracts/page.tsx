"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
    FileSignature,
    CheckCircle2,
    Clock,
    ExternalLink,
    Copy,
    Search,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

interface ContractRecord {
    room_id: string;
    tenant_name: string;
    signed_at: string;
    signer_ip: string;
    content_hash: string;
    signature: string; // base64
}

export default function ContractsPage() {
    const { rooms, getRoomsByBusiness, selectedBusinessId } = useBusiness();
    const { user } = useAuth();
    const [contracts, setContracts] = useState<ContractRecord[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // 관리자 전용: Supabase에서 서명된 계약서 목록 fetch
    useEffect(() => {
        if (!user) return;
        const fetchContracts = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("contracts")
                .select("room_id, tenant_name, signed_at, signer_ip, content_hash, signature");
            if (!error && data) setContracts(data as ContractRecord[]);
            setIsLoading(false);
        };
        fetchContracts();
    }, [user]);

    const visibleRooms = getRoomsByBusiness(selectedBusinessId).filter(r => r.status !== "VACANT");

    // 검색 필터
    const filtered = visibleRooms.filter(room => {
        const q = search.toLowerCase();
        return (
            room.name.toLowerCase().includes(q) ||
            (room.tenant?.name ?? "").toLowerCase().includes(q)
        );
    });

    const getContract = (roomId: string) =>
        contracts.find(c => c.room_id === roomId);

    const copyPortalLink = (roomId: string) => {
        const link = `${window.location.origin}/portal/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(roomId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <FileSignature size={24} className="text-blue-600" /> 전자계약서 관리
                </h1>
                <p className="text-neutral-500 mt-1">호실별 계약서 서명 현황 및 임차인 포털 링크를 관리합니다.</p>
            </header>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 text-center shadow-sm">
                    <div className="text-2xl font-bold text-neutral-900">{visibleRooms.length}</div>
                    <div className="text-sm text-neutral-500 mt-1">전체 입주 호실</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 text-center shadow-sm">
                    <div className="text-2xl font-bold text-emerald-600">{contracts.length}</div>
                    <div className="text-sm text-neutral-500 mt-1">서명 완료</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-amber-200 text-center shadow-sm">
                    <div className="text-2xl font-bold text-amber-600">
                        {visibleRooms.length - contracts.length}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">서명 미완료</div>
                </div>
            </div>

            {/* 검색 */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="호실명 또는 임차인 검색..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* 계약서 목록 */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                    <h2 className="font-bold text-neutral-900">호실별 계약서 현황</h2>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-neutral-400">로딩 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-50">
                        {filtered.map(room => {
                            const contract = getContract(room.id);
                            const portalUrl = `/portal/${room.id}`;
                            const contractUrl = `/contracts/${room.id}`;

                            return (
                                <div key={room.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* 호실 정보 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-neutral-900">{room.name}</span>
                                            <span className="text-sm text-neutral-500">{room.tenant?.name}</span>
                                            {contract ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 size={11} /> 서명 완료
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    <Clock size={11} /> 서명 대기
                                                </span>
                                            )}
                                        </div>

                                        {/* 법적 증거 정보 (서명 완료 시) */}
                                        {contract && (
                                            <div className="mt-2 text-xs text-neutral-400 space-y-0.5">
                                                <div>📅 서명일시: {new Date(contract.signed_at).toLocaleString("ko-KR")}</div>
                                                <div>🌐 서명자 IP: {contract.signer_ip}</div>
                                                <div className="font-mono truncate max-w-xs">🔐 {contract.content_hash?.substring(0, 24)}...</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 액션 버튼 */}
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        {/* 서명 이미지 미리보기 */}
                                        {contract?.signature && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={contract.signature}
                                                alt="서명"
                                                className="h-8 border border-neutral-200 rounded bg-white px-1"
                                            />
                                        )}

                                        {/* 계약서 보기 / 서명 요청 */}
                                        <Link
                                            href={contractUrl}
                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                                        >
                                            <FileSignature size={13} />
                                            {contract ? "계약서 보기" : "서명 요청"}
                                        </Link>

                                        {/* 임차인 포털 링크 복사 */}
                                        <button
                                            onClick={() => copyPortalLink(room.id)}
                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                        >
                                            {copiedId === room.id ? (
                                                <><CheckCircle2 size={13} /> 복사됨</>
                                            ) : (
                                                <><Copy size={13} /> 포털 링크</>
                                            )}
                                        </button>

                                        {/* 포털 직접 이동 */}
                                        <Link
                                            href={portalUrl}
                                            className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                                        >
                                            <ExternalLink size={13} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 임차인 접근 안내 */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> 임차인 계약서 접근 방법
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                    임차인은 별도 로그인 없이 <strong>포털 링크</strong>를 통해 본인 계약서를 확인하고 서명할 수 있어요.<br />
                    <span className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">포털 링크 복사</span> 버튼으로 링크를 복사 후 카카오톡/문자로 전달하세요.
                </p>
            </div>
        </div>
    );
}
