import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BusinessProvider } from "@/components/providers/BusinessProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AIAutoAgent from "@/components/dashboard/AIAutoAgent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "대우오피스 | 임대 자동화 시스템",
  description: "소규모 임대 사업자를 위한 효율적인 관리 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-50 text-neutral-900`}
      >
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
