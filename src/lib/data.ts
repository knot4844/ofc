export type RoomStatus = "PAID" | "UNPAID" | "VACANT";

export interface Tenant {
    id: string;
    name: string;
    contact?: string;
    companyName?: string;
    businessRegistrationNumber?: string;
}

export interface PaymentInfo {
    dueDate: string; // e.g., "매월 25일"
    monthlyRent: number; // e.g., 500000
    deposit: number; // e.g., 5000000
    isVATIncluded: boolean;
}

export interface Room {
    id: string;
    name: string; // e.g., "213호"
    businessId: string;
    status: RoomStatus;
    tenant: Tenant | null;
    paymentInfo: PaymentInfo | null;
    autoNotify: boolean;
    unpaidAmount?: number; // accumulated unpaid amount if status === "UNPAID"
    unpaidMonths?: number;
    leaseStart?: string;
    leaseEnd?: string;
}

export interface Business {
    id: string;
    name: string;
    ownerName: string;
    address: string;
}

// 1. 사업장 데이터
export const businesses: Business[] = [
    { id: "b_daewoo", name: "대우 고시원", ownerName: "대표님", address: "서울시 강남구 역삼동" },
    { id: "b_royal", name: "로얄 오피스텔", ownerName: "대표님", address: "서울시 서초구 서초동" },
    { id: "b_teheran", name: "테헤란로상가", ownerName: "대표님", address: "서울시 강남구 테헤란로" },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// 도우미 함수: 지정된 개수만큼 호실 생성
const generateRooms = (businessId: string, count: number, startRoomNum: number): Room[] => {
    const rooms: Room[] = [];
    for (let i = 0; i < count; i++) {
        // 공급가액 30만 ~ 60만 사이 (만원 단위)
        const monthlyRent = (30 + Math.floor(Math.random() * 31)) * 10000;
        const deposit = monthlyRent * 10;

        let status: RoomStatus = "PAID";
        if (Math.random() < 0.15) status = "VACANT"; // 15% 확률로 공실
        else if (Math.random() < 0.25) status = "UNPAID"; // 25% 확률로 미납

        const roomName = `${startRoomNum + i}호`;

        rooms.push({
            id: `r_${businessId}_${i}`,
            name: roomName,
            businessId,
            status,
            tenant: status === "VACANT" ? null : {
                id: generateId(),
                name: `임차인_${roomName}`,
                contact: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                companyName: `(주)비즈_${roomName}`,
                businessRegistrationNumber: `${Math.floor(100 + Math.random() * 899)}-81-${Math.floor(10000 + Math.random() * 89999)}`
            },
            paymentInfo: status === "VACANT" ? null : {
                dueDate: `매월 ${Math.floor(Math.random() * 28) + 1}일`,
                monthlyRent,
                deposit,
                isVATIncluded: false // 기본적으로 부가세 별도 (공급가액 기준)
            },
            autoNotify: status !== "VACANT" && Math.random() > 0.5,
            unpaidAmount: status === "UNPAID" ? monthlyRent * (Math.floor(Math.random() * 3) + 1) : 0,
            unpaidMonths: status === "UNPAID" ? Math.floor(Math.random() * 3) + 1 : 0,
            leaseStart: status === "VACANT" ? undefined : "2024-01-01",
            leaseEnd: status === "VACANT" ? undefined : (Math.random() > 0.8 ? "2024-11-30" : "2025-12-31")
        });
    }
    return rooms;
};

// 2. 대우오피스 호실 데이터 (30개)
const mockDaewooRooms = generateRooms("b_daewoo", 30, 201);

// 3. 로얄 오피스텔 호실 데이터 (5개)
const mockRoyalRooms = generateRooms("b_royal", 5, 101);

// 4. 테헤란로 상가 호실 데이터 (12개)
const mockTeheranRooms = generateRooms("b_teheran", 12, 101);

export const allRooms: Room[] = [...mockDaewooRooms, ...mockRoyalRooms, ...mockTeheranRooms];

// Mock API functions
export const getRoomsByBusiness = (businessId: string | "ALL"): Room[] => {
    if (businessId === "ALL") return allRooms;
    return allRooms.filter(r => r.businessId === businessId);
};
