"use client";

import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RoomStatusList } from "@/components/dashboard/RoomStatusList";
import { UnpaidSummary } from "@/components/dashboard/UnpaidSummary";
import { ContractExpiryWidget } from "@/components/dashboard/ContractExpiryWidget";
import { AIBriefingWidget } from "@/components/dashboard/AIBriefingWidget";
import { Building2, Wallet, CalendarDays } from "lucide-react";
import { useBusiness } from "@/components/providers/BusinessProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { user } = useAuth();
  const { selectedBusinessId, getRoomsByBusiness, currentBusiness } = useBusiness();

  const rooms = getRoomsByBusiness(selectedBusinessId);

  const totalRooms = rooms.length;
  const vacantRooms = rooms.filter(r => r.status === "VACANT").length;

  const unpaidRooms = rooms.filter(r => r.status === "UNPAID");
  const unpaidAmount = unpaidRooms.reduce((sum, r) => sum + (r.unpaidAmount || 0), 0);
  const unpaidCount = unpaidRooms.length;

  const totalRent = rooms.filter(r => r.status !== 'VACANT').reduce((sum, r) => sum + (r.paymentInfo?.monthlyRent || 0), 0);

  const today = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);
  const expiringRoomsCount = rooms.filter((r) => {
    if (!r.leaseEnd || r.status === 'VACANT') return false;
    const endDate = new Date(r.leaseEnd);
    return endDate >= today && endDate <= sixtyDaysFromNow;
  }).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          안녕하세요, {user?.id === 'demo-user-123' ? '대표' : (user?.email?.split('@')[0] || '관리자')}님 👋
        </h1>
        <p className="text-neutral-500 mt-1">오늘의 {currentBusiness?.name || '전체'} 임대 현황을 한눈에 확인하세요.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="공실 현황"
          value={`${vacantRooms}실`}
          subtitle={`전체 ${totalRooms}개 호실 중`}
          icon={<Building2 className="text-blue-500" size={24} />}
        />
        <DashboardCard
          title="총 임대료 예상액"
          value={`₩ ${(totalRent).toLocaleString()}`}
          subtitle="공실 제외 설정된 월세 합계"
          icon={<Wallet className="text-indigo-500" size={24} />}
        />
        <DashboardCard
          title="이번 달 미수금"
          value={`₩ ${unpaidAmount.toLocaleString()}`}
          subtitle={`${unpaidCount}명의 임차인이 미납 상태입니다`}
          icon={<Wallet className="text-rose-500" size={24} />}
        />

        <DashboardCard
          title="다가오는 세금 신고"
          value="D-12"
          subtitle="2026년 1기 예정 부가세 신고"
          icon={<CalendarDays className="text-amber-500" size={24} />}
        />
        <DashboardCard
          title="계약 만료 임차인"
          value={`${expiringRoomsCount}명`}
          subtitle="60일 이내 만료 예정 (상세 하단참조)"
          icon={<CalendarDays className="text-emerald-500" size={24} />}
        />
        <div className="bg-neutral-50/50 border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 hover:border-neutral-300 transition-colors cursor-pointer min-h-[140px] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          </div>
          <span className="text-sm font-medium">새 항목 추가하기</span>
          <span className="text-xs text-neutral-400 mt-1 mt-1">사용자 정의 위젯</span>
        </div>
      </section>

      {/* AI Daily Briefing */}
      <section>
        <AIBriefingWidget />
      </section>

      <section>
        <ContractExpiryWidget />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <section className="lg:col-span-1">
          <UnpaidSummary />
        </section>
        <section className="lg:col-span-3">
          <RoomStatusList />
        </section>
      </div>
    </div>
  );
}
