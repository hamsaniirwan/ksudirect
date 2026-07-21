import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. IMPORT KOMPONEN BOTTOM NAV
import BottomNav from "@/components/BottomNav"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KSU Direct",
  description: "Sistem Cadangan Penambahbaikan KSU Direct",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50`}
    >
      {/* 2. TAMBAH pb-20 SUPAYA KANDUNGAN TIDAK TERLINDUNG DI BAWAH BOTTOM NAV PADA MOBILE */}
      <body className="min-h-full flex flex-col md:pb-0 pb-20">
        
        {/* Kandungan Sistem */}
        <main className="flex-1">
          {children}
        </main>

        {/* 3. MASUKKAN KOMPONEN BOTTOM NAV DI SINI */}
        <BottomNav />
        
      </body>
    </html>
  );
}