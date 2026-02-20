"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Business } from "@/lib/data";
import { useAuth } from "./AuthProvider";

interface BusinessContextType {
    selectedBusinessId: string;
    setSelectedBusinessId: (id: string) => void;
    currentBusiness: Business | undefined;
    allBusinesses: Business[];
    rooms: Room[];
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
    getRoomsByBusiness: (businessId: string) => Room[];
    isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("ALL");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const currentBusiness = allBusinesses.find(b => b.id === selectedBusinessId);

    const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

    // Fetch businesses and rooms from Supabase
    useEffect(() => {
        if (!useSupabase || !user) {
            setAllBusinesses([]);
            setRooms([]);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Businesses (Auto-filtered by RLS owner_id)
                // Since Demo User sets owner_id to NULL, demo users will get those rows too!
                const { data: bData, error: bError } = await supabase.from('businesses').select('*');
                if (bError) throw bError;

                if (bData) {
                    const mappedBusinesses: Business[] = bData.map((d: any) => ({
                        id: d.id,
                        name: d.name,
                        ownerName: d.owner_name || user.email?.split('@')[0] || "대표님",
                        address: d.address || ""
                    }));
                    setAllBusinesses(mappedBusinesses);
                    if (mappedBusinesses.length > 0 && selectedBusinessId === "ALL" && false) {
                        // Optional: auto-select first business if needed, but ALL is fine
                    }
                }

                // 2. Fetch Rooms
                const { data: rData, error: rError } = await supabase.from('rooms').select('*');
                if (rError) throw rError;

                if (rData && rData.length > 0) {
                    const mappedRooms: Room[] = rData.map((d: any) => ({
                        id: d.id,
                        businessId: d.business_id,
                        name: d.name,
                        status: d.status,
                        autoNotify: d.auto_notify,
                        unpaidMonths: d.unpaid_months,
                        unpaidAmount: d.unpaid_amount,
                        leaseStart: d.lease_start,
                        leaseEnd: d.lease_end,
                        paymentInfo: {
                            deposit: d.deposit,
                            monthlyRent: d.monthly_rent,
                            dueDate: d.due_date,
                            isVATIncluded: d.is_vat_included
                        },
                        tenant: d.tenant_id ? {
                            id: d.tenant_id,
                            name: d.tenant_name,
                            contact: d.tenant_contact,
                            companyName: d.tenant_company_name,
                            businessRegistrationNumber: d.tenant_business_reg_num
                        } : null
                    }));
                    setRooms(mappedRooms);
                }
            } catch (err) {
                console.error("Failed to fetch data from Supabase:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [useSupabase, user]);

    const getRoomsByBusiness = (businessId: string) => {
        if (businessId === "ALL") return rooms;
        return rooms.filter(r => r.businessId === businessId);
    };

    return (
        <BusinessContext.Provider value={{
            selectedBusinessId,
            setSelectedBusinessId,
            currentBusiness,
            allBusinesses,
            rooms,
            setRooms,
            getRoomsByBusiness,
            isLoading
        }}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error("useBusiness must be used within a BusinessProvider");
    }
    return context;
}
