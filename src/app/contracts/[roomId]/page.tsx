"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { allRooms, Room } from "@/lib/data";
import { SignaturePad } from "@/components/contracts/SignaturePad";
import {
    FileSignature,
    CheckCircle2,
    Home,
    AlertCircle,
    Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ContractPage() {
    const params = useParams();
    const router = useRouter();

    const [isSigned, setIsSigned] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [signDate, setSignDate] = useState<string | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const roomId = params?.roomId as string;

    useEffect(() => {
        if (roomId) {
            const foundRoom = allRooms.find(r => r.id === roomId);
            setRoom(foundRoom || null);
            setIsLoading(false);
        }
    }, [roomId]);

    if (isLoading) return null;

    if (!room) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
                    <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">계약 정보를 찾을 수 없습니다</h2>
                    <p className="text-neutral-500 mb-6 text-sm">올바른 계약 링크인지 다시 확인해 주세요.</p>
                </div>
            </div>
        );
    }

    const { tenant, paymentInfo } = room;

    const handleSaveSignature = (base64Data: string) => {
        setSignatureImage(base64Data);

        // In a real app, you would send this to Supabase with the roomId
        /*
          await supabase
            .from('contracts')
            .upsert({ room_id: room.id, signature: base64Data, signed_at: new Date().toISOString() })
        */

        const now = new Date();
        const formattedDate = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        setSignDate(formattedDate);
        setIsSigned(true);
    };

    if (isSigned) {
        return (
            <div className="min-h-screen bg-neutral-50 p-4 md:p-8 flex items-center justify-center">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm max-w-lg w-full text-center border border-neutral-200 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 mb-3 tracking-tight">전자 서명이 완료되었습니다</h1>
                    <p className="text-neutral-500 mb-8 leading-relaxed">
                        계약서에 서명이 안전하게 기록되었으며,<br /> 전자서명법에 따라 법적 효력이 발생합니다.
                    </p>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-8 text-left">
                        <span className="text-xs font-bold text-neutral-400 block mb-1">타임스탬프 (서명 일시)</span>
                        <span className="text-sm font-mono text-neutral-900 font-bold">{signDate}</span>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold text-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                        <Download size={20} />
                        계약서 PDF 다운로드
                    </button>

                    <Link
                        href={`/portal/${room.id}`}
                        className="w-full block py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-lg hover:bg-neutral-50 transition-colors"
                    >
                        내 마이페이지로 이동
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-4 py-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <FileSignature size={18} />
                    </div>
                    <span className="font-exrabold text-lg text-neutral-900 tracking-tight">전자계약서 서명</span>
                </div>
                <Link href="/" className="text-neutral-500 hover:text-neutral-900 p-2">
                    <Home size={20} />
                </Link>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-8 mt-4">
                {/* Contract Document Preview */}
                <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl md:rounded-3xl p-6 md:p-12 mb-8">
                    <h1 className="text-3xl font-black text-center text-neutral-900 tracking-tight mb-12">부동산 임대차 계약서</h1>

                    <div className="space-y-8 text-sm md:text-base text-neutral-800 leading-loose mx-auto max-w-xl">
                        <p>
                            임대인(이하 "갑"이라 한다)과 임차인(이하 "을"이라 한다)은 아래 기재된 부동산에 관하여 다음과 같이 임대차 계약을 체결한다.
                        </p>

                        <div className="border border-neutral-200 rounded-xl overflow-hidden mt-6">
                            <table className="w-full text-left border-collapse">
                                <tbody>
                                    <tr className="border-b border-neutral-200">
                                        <th className="bg-neutral-50 p-4 font-bold text-neutral-700 w-1/3">소재지</th>
                                        <td className="p-4 font-bold">{room.name}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-200">
                                        <th className="bg-neutral-50 p-4 font-bold text-neutral-700">임대할 부분</th>
                                        <td className="p-4">전체</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-3 mt-8 pb-2 border-b-2 border-neutral-900 inline-block">제 1 조 (목적 및 임대료)</h3>
                            <p>위 부동산의 임대차에 있어 "갑"과 "을"은 합의하에 임대보증금 및 월임대료를 아래와 같이 지불하기로 한다.</p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
                                <li><span className="font-medium text-neutral-500 inline-block w-20">보증금</span> <span className="font-bold">금 {paymentInfo?.deposit.toLocaleString()} 원정</span></li>
                                <li><span className="font-medium text-neutral-500 inline-block w-20">월세</span> <span className="font-bold text-blue-600">금 {paymentInfo?.monthlyRent.toLocaleString()} 원정</span> (매월 {paymentInfo?.dueDate} 지급)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-3 mt-8 pb-2 border-b-2 border-neutral-900 inline-block">제 2 조 (존속기간)</h3>
                            <p>"갑"은 위 부동산을 목적대로 사용 ㆍ수익할 수 있는 상태로 하여 <span className="font-bold text-rose-600 px-1 bg-rose-50">{room.leaseStart}</span> 부터 <span className="font-bold text-rose-600 px-1 bg-rose-50">{room.leaseEnd}</span> 까지 "을"에게 임대하며, 임대차 존속기간으로 한다.</p>
                        </div>

                        <div className="pt-8 text-neutral-500 text-sm text-center">
                            본 계약을 증명하기 위하여 "갑"과 "을"은 이의가 없음을 확인하고,<br /> 아래 전자서명 패드에 각각 자필 서명한다.
                        </div>

                        <div className="pt-8 flex flex-col items-center gap-1 border-t border-neutral-200 mt-8">
                            <span className="text-neutral-400 font-bold mb-2">임차인 ("을")</span>
                            <span className="text-2xl font-black text-neutral-900 tracking-tight">{tenant?.name} ({tenant?.companyName})</span>
                        </div>
                    </div>
                </div>

                {/* Signature Component */}
                <div className="animate-in slide-in-from-bottom-8 duration-500">
                    <SignaturePad onSave={handleSaveSignature} />
                </div>
            </main>
        </div>
    );
}
