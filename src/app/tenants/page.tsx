"use client";

import React, { useState, useRef } from "react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { Room } from "@/lib/data";
import { Search, Info, MessageSquare, AlertCircle, Upload, Download, Loader2, Link as LinkIcon, Plus, X } from "lucide-react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function TenantsPage() {
    const { selectedBusinessId, currentBusiness, getRoomsByBusiness, setRooms, rooms: allContextRooms, isLoading: isRoomsLoading, allBusinesses } = useBusiness();
    const { user } = useAuth();
    const rooms = getRoomsByBusiness(selectedBusinessId);
    const isDemoUser = user?.id === 'demo-user-123';

    const [searchQuery, setSearchQuery] = useState("");
    const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [generatingLink, setGeneratingLink] = useState<string | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [addRoomForm, setAddRoomForm] = useState({ name: '', tenantName: '', tenantContact: '', monthlyRent: 0, deposit: 0, leaseStart: '', leaseEnd: '', businessId: '' });
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotification = (type: 'success' | 'error', text: string) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 3000);
    };

    // 호실 추가 (실제 사용자만)
    const handleAddRoom = async () => {
        const bizId = addRoomForm.businessId || allBusinesses[0]?.id;
        if (!bizId) return showNotification('error', '사업장을 먼저 추가해주세요.');
        if (!addRoomForm.name) return showNotification('error', '호실명을 입력해주세요.');
        setIsAddingRoom(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session!.access_token}` },
                body: JSON.stringify({ ...addRoomForm, businessId: bizId, status: addRoomForm.tenantName ? 'PAID' : 'VACANT' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const newRoom: Room = {
                id: data.room.id, businessId: bizId, name: addRoomForm.name,
                status: addRoomForm.tenantName ? 'PAID' : 'VACANT',
                autoNotify: true, unpaidMonths: 0, unpaidAmount: 0,
                leaseStart: addRoomForm.leaseStart, leaseEnd: addRoomForm.leaseEnd,
                paymentInfo: { monthlyRent: addRoomForm.monthlyRent, deposit: addRoomForm.deposit, dueDate: '매월 25일', isVATIncluded: false },
                tenant: addRoomForm.tenantName ? { id: data.room.id, name: addRoomForm.tenantName, contact: addRoomForm.tenantContact } : null
            };
            setRooms(prev => [...prev, newRoom]);
            setShowAddRoom(false);
            setAddRoomForm({ name: '', tenantName: '', tenantContact: '', monthlyRent: 0, deposit: 0, leaseStart: '', leaseEnd: '', businessId: '' });
            showNotification('success', `${addRoomForm.name} 호실이 추가되었습니다.`);
        } catch (e: any) {
            showNotification('error', e.message);
        } finally {
            setIsAddingRoom(false);
        }
    };

    const handleGenerateInviteLink = async (roomId: string) => {
        setGeneratingLink(roomId);
        try {
            const res = await fetch('/api/invite/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || '초대 링크 생성 실패');

            await navigator.clipboard.writeText(data.inviteUrl);
            showNotification('success', '초대 링크가 클립보드에 복사되었습니다. 임차인에게 전달해주세요.');
        } catch (error: any) {
            showNotification('error', error.message || '초대 링크를 생성할 수 없습니다.');
        } finally {
            setGeneratingLink(null);
        }
    };

    // Filter logic
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.includes(searchQuery) ||
            (room.tenant?.name || "").includes(searchQuery);
        const matchesUnpaid = showOnlyUnpaid ? room.status === "UNPAID" : true;
        return matchesSearch && matchesUnpaid;
    });

    // Checkbox logic
    const toggleSelectAll = () => {
        if (selectedRooms.size === filteredRooms.length) {
            setSelectedRooms(new Set());
        } else {
            setSelectedRooms(new Set(filteredRooms.map(r => r.id)));
        }
    };

    const toggleSelectRoom = (id: string) => {
        const newSet = new Set(selectedRooms);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedRooms(newSet);
    };

    const handleBulkNotification = () => {
        if (selectedRooms.size === 0) return;
        showNotification('success', `${selectedRooms.size}명의 임차인에게 카카오톡/문자 알림을 발송했습니다.`);
        setSelectedRooms(new Set());
    };

    // Excel Download
    const handleExcelDownload = () => {
        const dataToExport = filteredRooms.map(r => ({
            "호수": r.name,
            "계약시작일": r.leaseStart || "",
            "계약종료일": r.leaseEnd || "",
            "임대보증금": r.paymentInfo?.deposit || 0,
            "임대금액(월세)": r.paymentInfo?.monthlyRent || 0,
            "사업자등록번호": r.tenant?.businessRegistrationNumber || "",
            "상호명": r.tenant?.companyName || "",
            "부가세 발행여부": r.paymentInfo?.isVATIncluded ? "Y" : "N",
            "현재 상태": r.status === "VACANT" ? "공실" : r.status === "UNPAID" ? "미납" : "정상",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "호실 및 임차인 정보");

        const fileName = `${currentBusiness ? currentBusiness.name : "전체사업장"}_임대정보.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // Excel Upload
    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: "binary" });
                const wsname = workbook.SheetNames[0];
                const ws = workbook.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[];

                const updatedRooms = allContextRooms.map(room => {
                    const updatedData = data.find(d => String(d["호수"]) === room.name && (currentBusiness ? room.businessId === currentBusiness.id : true));
                    if (updatedData) {
                        return {
                            ...room,
                            leaseStart: updatedData["계약시작일"]?.toString() || room.leaseStart,
                            leaseEnd: updatedData["계약종료일"]?.toString() || room.leaseEnd,
                            paymentInfo: room.paymentInfo ? {
                                ...room.paymentInfo,
                                deposit: Number(updatedData["임대보증금"]) || room.paymentInfo.deposit,
                                monthlyRent: Number(updatedData["임대금액(월세)"]) || room.paymentInfo.monthlyRent,
                                isVATIncluded: updatedData["부가세 발행여부"] === "Y"
                            } : null,
                            tenant: room.tenant ? {
                                ...room.tenant,
                                businessRegistrationNumber: updatedData["사업자등록번호"]?.toString() || room.tenant.businessRegistrationNumber,
                                companyName: updatedData["상호명"]?.toString() || room.tenant.companyName
                            } : null
                        };
                    }
                    return room;
                });

                // Check if Supabase is active
                const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

                if (useSupabase) {
                    // Update Supabase Database
                    // Note: Here we update each found DB record. In a real scenario, this should be bulk upsert.
                    for (const room of updatedRooms) {
                        // find if this room was changed from the uploaded data
                        const isChanged = data.find(d => String(d["호수"]) === room.name && (currentBusiness ? room.businessId === currentBusiness.id : true));
                        if (isChanged) {
                            await supabase.from('rooms').update({
                                lease_start: room.leaseStart,
                                lease_end: room.leaseEnd,
                                deposit: room.paymentInfo?.deposit,
                                monthly_rent: room.paymentInfo?.monthlyRent,
                                is_vat_included: room.paymentInfo?.isVATIncluded,
                                tenant_business_reg_num: room.tenant?.businessRegistrationNumber,
                                tenant_company_name: room.tenant?.companyName
                            }).eq('id', room.id);
                        }
                    }
                }

                setRooms(updatedRooms);
                showNotification('success', '엑셀 데이터가 성공적으로 반영되었습니다.');
            } catch (error) {
                console.error('Excel Error:', error);
                showNotification('error', '엑셀 업로드 중 오류가 발생했습니다.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* 토스트 알림 */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${notification.type === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                    }`}>
                    {notification.text}
                </div>
            )}
            {/* 호실 추가 모달 */}
            {showAddRoom && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-neutral-900">새 호실 추가</h2>
                            <button onClick={() => setShowAddRoom(false)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={18} /></button>
                        </div>
                        {allBusinesses.length > 1 && (
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">사업장</label>
                                <select className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none" value={addRoomForm.businessId} onChange={e => setAddRoomForm({ ...addRoomForm, businessId: e.target.value })}>
                                    {allBusinesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">호실명 *</label>
                                <input className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="101호" value={addRoomForm.name} onChange={e => setAddRoomForm({ ...addRoomForm, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">월세 (원)</label>
                                <input type="number" className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" value={addRoomForm.monthlyRent} onChange={e => setAddRoomForm({ ...addRoomForm, monthlyRent: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">임차인명</label>
                                <input className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="홍길동" value={addRoomForm.tenantName} onChange={e => setAddRoomForm({ ...addRoomForm, tenantName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">연락처</label>
                                <input className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="010-0000-0000" value={addRoomForm.tenantContact} onChange={e => setAddRoomForm({ ...addRoomForm, tenantContact: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">계약 시작일</label>
                                <input type="date" className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" value={addRoomForm.leaseStart} onChange={e => setAddRoomForm({ ...addRoomForm, leaseStart: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">계약 종료일</label>
                                <input type="date" className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:border-blue-500" value={addRoomForm.leaseEnd} onChange={e => setAddRoomForm({ ...addRoomForm, leaseEnd: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowAddRoom(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50">취소</button>
                            <button onClick={handleAddRoom} disabled={isAddingRoom} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                {isAddingRoom ? <Loader2 size={16} className="animate-spin mx-auto" /> : '추가하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">호실 및 임차인 관리</h1>
                    <p className="text-neutral-500 mt-1">
                        {currentBusiness ? currentBusiness.name : "전체 사업장"}의 임대 현황을 상세하게 관리합니다.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isDemoUser && (
                        <button onClick={() => setShowAddRoom(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all text-sm">
                            <Plus size={16} /> 호실 추가
                        </button>
                    )}
                    <button
                        onClick={handleBulkNotification}
                        disabled={selectedRooms.size === 0}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${selectedRooms.size > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            }`}
                    >
                        <MessageSquare size={18} />
                        단체 알림톡 발송 ({selectedRooms.size})
                    </button>
                    {/* Excel Upload/Download Buttons */}
                    <div className="flex bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden text-sm">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors border-r border-neutral-200"
                        >
                            <Upload size={16} />
                            업로드
                        </button>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleExcelUpload}
                        />
                        <button
                            onClick={handleExcelDownload}
                            className="flex items-center gap-2 px-3 py-2 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors"
                        >
                            <Download size={16} />
                            다운로드
                        </button>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="호실 또는 임차인명 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 sm:flex-auto justify-center ${showOnlyUnpaid
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                            }`}
                    >
                        <AlertCircle size={16} />
                        미납자만 보기
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-neutral-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        checked={filteredRooms.length > 0 && selectedRooms.size === filteredRooms.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4">호실명</th>
                                <th className="p-4">임차인</th>
                                <th className="p-4">연락처</th>
                                <th className="p-4">약정 임대료</th>
                                <th className="p-4">상태</th>
                                <th className="p-4 text-right">미납액</th>
                                <th className="p-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredRooms.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-neutral-500">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredRooms.map(room => {
                                    const isUnpaid = room.status === "UNPAID";
                                    const isVacant = room.status === "VACANT";

                                    return (
                                        <tr key={room.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-neutral-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedRooms.has(room.id)}
                                                    onChange={() => toggleSelectRoom(room.id)}
                                                    disabled={isVacant}
                                                />
                                            </td>
                                            <td className="p-4 font-bold text-neutral-900">{room.name}</td>
                                            <td className="p-4 text-neutral-700">
                                                {isVacant ? <span className="text-neutral-400 italic">공실</span> : room.tenant?.name}
                                            </td>
                                            <td className="p-4 text-neutral-500">
                                                {!isVacant && room.tenant?.contact}
                                            </td>
                                            <td className="p-4 text-neutral-700">
                                                {!isVacant && `₩ ${room.paymentInfo?.monthlyRent.toLocaleString()}`}
                                                {!isVacant && room.paymentInfo?.isVATIncluded && <span className="ml-1 text-[10px] text-neutral-400">(VAT포함)</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${isUnpaid ? "bg-rose-100 text-rose-700" :
                                                    isVacant ? "bg-neutral-100 text-neutral-600" :
                                                        "bg-emerald-100 text-emerald-700"
                                                    }`}>
                                                    {isUnpaid ? `${room.unpaidMonths}개월 미납` : isVacant ? "공실" : "정상"}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-medium ${isUnpaid ? "text-rose-600" : "text-neutral-400"}`}>
                                                {isUnpaid ? `₩ ${room.unpaidAmount?.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleGenerateInviteLink(room.id)}
                                                        disabled={isVacant || generatingLink === room.id}
                                                        className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${isVacant ? "text-neutral-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                                                            }`}
                                                        title="초대 링크 복사"
                                                    >
                                                        {generatingLink === room.id ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                                                    </button>
                                                    <Link href={`/rooms/${room.id}`} className="inline-block text-neutral-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="호실 상세 정보">
                                                        <Info size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
