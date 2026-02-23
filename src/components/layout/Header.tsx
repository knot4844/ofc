"use client";

import React from "react";
import { Bell, Search, User as UserIcon, Menu, LogOut } from "lucide-react";
import { useAuth, toggleDemoLogin } from "@/components/providers/AuthProvider";
import { useBusiness } from "@/components/providers/BusinessProvider";

export function Header() {
    const { user, signOut } = useAuth();
    const { currentBusiness } = useBusiness();

    return (
        <header className="h-16 px-4 md:px-8 border-b border-neutral-200 bg-white flex items-center justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
                <button className="md:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                    <Menu size={24} />
                </button>
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                        type="text"
                        placeholder="임차인, 호실, 전화번호 검색..."
                        className="w-full pl-9 pr-4 py-2 bg-neutral-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-neutral-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-6 w-px bg-neutral-200"></div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 hover:bg-neutral-50 px-2 py-1 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                            <UserIcon size={16} />
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium text-neutral-900 leading-none truncate max-w-[150px]">
                                {user?.email?.split('@')[0] || "관리자"}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1 leading-none truncate max-w-[150px]">
                                {currentBusiness?.name || "Nabido"}
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            if (user?.id === 'demo-user-123') {
                                toggleDemoLogin(false);
                            } else {
                                signOut();
                            }
                        }}
                        title="로그아웃"
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
