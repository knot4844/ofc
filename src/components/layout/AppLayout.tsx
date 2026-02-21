"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BusinessProvider } from "../providers/BusinessProvider";
import AIAutoAgent from "../dashboard/AIAutoAgent";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Only apply dashboard layout wrappers when NOT on standard public routes
    const isPublicRoute = ['/', '/login', '/master-admin', '/terms', '/privacy'].includes(pathname) || pathname?.startsWith('/pricing');

    if (isPublicRoute) {
        return <>{children}</>;
    }

    return (
        <BusinessProvider>
            <Sidebar />
            <div className="md:ml-64 min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
            <AIAutoAgent />
        </BusinessProvider>
    );
}
