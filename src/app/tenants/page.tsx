"use client";

import React, { useState, useRef } from "react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { Room } from "@/lib/data";
import { Search, Info, MessageSquare, AlertCircle, Upload, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function TenantsPage() {
    const { selectedBusinessId, currentBusiness, getRoomsByBusiness, setRooms, rooms: allContextRooms, isLoading: isRoomsLoading } = useBusiness();
    const rooms = getRoomsByBusiness(selectedBusinessId);

    const [searchQuery, setSearchQuery] = useState("");
    const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        alert(`${selectedRooms.size}명의 임차인에게 카카오톡/문자 알림을 발송합니다.`);
        // Reset selection after sending
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
                alert("엑셀 데이터가 성공적으로 분석 및 반영되었습니다.");
            } catch (error) {
                console.error("Excel Error:", error);
                alert("엑셀 업로드 중 오류가 발생했습니다.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">호실 및 임차인 관리</h1>
                    <p className="text-neutral-500 mt-1">
                        {currentBusiness ? currentBusiness.name : "전체 사업장"}의 임대 현황을 상세하게 관리합니다.
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                                                <Link href={`/rooms/${room.id}`} className="inline-block text-neutral-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="호실 상세 정보">
                                                    <Info size={18} />
                                                </Link>
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
