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
          value={`${vacantRooms}/${totalRooms}실`}
          subtitle={`전체 ${totalRooms}개 호실 중 ${vacantRooms}개 공실`}
          icon={<Building2 className="text-blue-500" size={24} />}
          trend={{ value: 12, isPositive: false }}
        />
        <DashboardCard
          title="이번 달 미수금"
          value={`₩ ${unpaidAmount.toLocaleString()}`}
          subtitle={`${unpaidCount}명의 임차인이 미납 상태입니다`}
          icon={<Wallet className="text-rose-500" size={24} />}
          trend={{ value: 5.2, isPositive: true }}
        />
        <DashboardCard
          title="다가오는 세금 신고"
          value="D-12"
          subtitle="2026년 1기 예정 부가세 신고"
          icon={<CalendarDays className="text-emerald-500" size={24} />}
        />
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
