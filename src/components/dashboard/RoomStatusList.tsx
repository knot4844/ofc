"use client";

import React, { useState, useEffect } from "react";
import { Plus, Bell } from "lucide-react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { Room } from "@/lib/data";

export function RoomStatusList() {
    const { selectedBusinessId, getRoomsByBusiness, setRooms, rooms: allRooms } = useBusiness();

    // Derived state directly in render (React standard for derived context state)
    const rooms = getRoomsByBusiness(selectedBusinessId);

    const toggleAutoNotify = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setRooms(allRooms.map(room =>
            room.id === id ? { ...room, autoNotify: !room.autoNotify } : room
        ));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-neutral-900">전체 호실 현황 ({rooms.length}개)</h2>
                <div className="flex gap-4 text-sm hidden sm:flex">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-neutral-600">납부완료</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span className="text-neutral-600">미납</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-white border border-neutral-300"></span>
                        <span className="text-neutral-600">공실</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {rooms.map((room) => {
                    const isPaid = room.status === "PAID";
                    const isUnpaid = room.status === "UNPAID";
                    const isVacant = room.status === "VACANT";

                    return (
                        <div
                            key={room.id}
                            className={`relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${isPaid ? "bg-emerald-50/30 border-emerald-200 hover:border-emerald-400" :
                                isUnpaid ? "bg-rose-50 border-rose-200 hover:border-rose-400" :
                                    "bg-white border-neutral-200 hover:border-neutral-400"
                                }`}
                        >
                            {!isVacant && (
                                <button
                                    onClick={(e) => toggleAutoNotify(e, room.id)}
                                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${room.autoNotify ? "text-blue-600 bg-blue-100" : "text-neutral-300 hover:bg-neutral-100"
                                        }`}
                                    title="자동 알림톡 발송"
                                >
                                    <Bell size={12} fill={room.autoNotify ? "currentColor" : "none"} />
                                </button>
                            )}

                            <span className={`font-bold mb-1 ${isUnpaid ? "text-rose-700" : isPaid ? "text-emerald-800" : "text-neutral-900"}`}>
                                {room.name}
                            </span>

                            {!isVacant ? (
                                <>
                                    <span className={`text-xs font-medium ${isUnpaid ? "text-rose-600" : "text-emerald-700"}`}>
                                        {room.tenant?.name}
                                    </span>
                                    <span className={`text-[10px] mt-1 ${isUnpaid ? "text-rose-500 font-bold" : "text-emerald-600"}`}>
                                        {isUnpaid ? "미납 발생" : room.paymentInfo?.dueDate}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs text-neutral-400 font-medium py-1">공실</span>
                            )}
                        </div>
                    );
                })}

                {/* Add Room Button */}
                <div className="p-4 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 group min-h-[100px]">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 mb-2 transition-colors">
                        <Plus size={16} />
                    </div>
                    <span className="text-xs font-bold text-neutral-500 group-hover:text-blue-700 transition-colors">
                        호실 추가
                    </span>
                </div>
            </div>
        </div>
    );
}
