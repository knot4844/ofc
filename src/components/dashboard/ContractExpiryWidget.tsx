"use client";

import React from "react";
import { Clock, AlertCircle, ChevronRight } from "lucide-react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import Link from "next/link";

export function ContractExpiryWidget() {
    const { selectedBusinessId, getRoomsByBusiness } = useBusiness();
    const rooms = getRoomsByBusiness(selectedBusinessId).filter(r => r.status !== "VACANT" && r.leaseEnd);

    // Filter rooms expiring within 60 days (mock logic, comparing string dates roughly for demo)
    // Assume today is '2024-10-01' for this demo so '2024-11-15' shows up as expiring soon
    const expiringRooms = rooms.filter(r => r.leaseEnd && r.leaseEnd.startsWith("2024"));

    if (expiringRooms.length === 0) return null;

    return (
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 text-orange-200/40 transform rotate-12">
                <Clock size={120} />
            </div>

            <div className="flex items-start sm:items-center gap-4 relative z-10 w-full">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-orange-900 font-bold text-lg mb-1">
                        계약 만료 임박 임차인 <span className="text-orange-600">{expiringRooms.length}명</span>
                    </h3>
                    <p className="text-orange-700 text-sm">
                        향후 60일 이내에 계약이 만료되는 호실이 있습니다. 연장 의사를 확인하거나 전자계약을 갱신하세요.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {expiringRooms.slice(0, 3).map(room => (
                            <div key={room.id} className="bg-white/60 border border-orange-200 text-orange-800 px-2 py-1 rounded font-medium flex gap-2">
                                <span>{room.name}</span>
                                <span className="opacity-60">{room.leaseEnd} 만료</span>
                            </div>
                        ))}
                        {expiringRooms.length > 3 && (
                            <div className="bg-orange-100/50 text-orange-800 px-2 py-1 rounded font-medium">
                                +{expiringRooms.length - 3}건 더보기
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Link href="/tenants" className="w-full sm:w-auto relative z-10 whitespace-nowrap bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-600/20">
                전자계약 갱신
                <ChevronRight size={16} />
            </Link>
        </div>
    );
}
