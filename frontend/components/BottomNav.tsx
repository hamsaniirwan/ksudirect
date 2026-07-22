"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState("");

  // Baca maklumat pengguna dari localStorage setiap kali laluan berubah
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setRole(userObj.role || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, [pathname]);

  // Sembunyikan Bottom Nav jika berada di halaman Log Masuk utama atau role belum di-load
  if (pathname === "/" || !role) return null;

  // =========================================================
  // DEFINISI SEMUA MENU YANG ADA DALAM SISTEM
  // =========================================================
  const menuUtama = {
    name: "Utama",
    path: "/dashboard", // Papan Pemuka Biasa (Untuk Pengguna/Bahagian)
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  };

  const menuHantar = {
    name: "Hantar",
    path: "/pengguna/hantar-cadangan",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  };

  const menuSemak = {
    name: "Semakan",
    path: "/pengguna/semak-cadangan",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  const menuTugasan = {
    name: "Tugasan",
    path: "/bahagian/tugasan",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  };

  const menuEksekutif = {
    name: "Eksekutif",
    path: "/admin/papan-pemuka", // Dashboard Eksekutif
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  };

  const menuPetiMasuk = {
    name: "Peti Masuk",
    path: "/admin/peti-masuk",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  };

  // =========================================================
  // SUSUNAN MENU MENGIKUT PERANAN (ROLES)
  // =========================================================
  let navLinks: { name: string; path: string; icon: React.ReactNode }[] = [];

  // 1. ADMIN / KSU / PEGAWAI KHAS
  if (role === "admin" || role === "ksu" || role === "special_officer" || role === "pegawai_khas") {
    navLinks = [
      menuEksekutif, // Guna menu Eksekutif sebagai ganti menu Utama
      menuHantar,
      menuSemak,
      menuPetiMasuk,
    ];
  }
  // 2. KETUA BAHAGIAN
  else if (role === "division_head" || role === "bahagian") {
    navLinks = [menuUtama, menuHantar, menuSemak, menuTugasan];
  }
  // 3. OFFICER / PENGGUNA (LALAI / DEFAULT)
  else {
    navLinks = [menuUtama, menuHantar, menuSemak];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] border-t border-[#E5E0D3] bg-white/95 shadow-[0_-4px_24px_rgba(10,31,61,0.08)] backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {/* Render Menu Dinamik */}
        {navLinks.map((link) => {
          // Check jika path aktif
          const isActive = pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              href={link.path}
              className={`relative flex h-full w-full flex-col items-center justify-center space-y-0.5 transition-colors duration-200 ${
                isActive ? "text-[#0A1F3D]" : "text-[#94A3B8] hover:text-[#475569]"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#C6A15B]" />
              )}
              <div
                className={`rounded-xl p-1.5 transition-all ${
                  isActive ? "bg-[#0A1F3D]/[0.06]" : "bg-transparent"
                }`}
              >
                {link.icon}
              </div>
              <span className="px-1 text-center text-[9px] font-bold leading-tight tracking-tight sm:text-[10px]">
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}