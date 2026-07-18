"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // State untuk UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State untuk Data Pengguna
  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("user");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ambil data profil dari local storage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name);
      setUserRole(parsedData.role);
    }

    // Tutup dropdown jika klik di luar
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Format peranan
  const roleDisplay: Record<string, string> = {
    user: "Pegawai MOT",
    special_officer: "Pegawai Khas KSU",
    ksu: "Ketua Setiausaha",
    division_head: "Ketua Bahagian",
    admin: "Pentadbir Sistem",
  };
  const currentRole = roleDisplay[userRole] || "Pengguna";

  // Check untuk akses menu (RBAC)
  const isAdminOrManagement = ["admin", "ksu", "special_officer"].includes(userRole);
  const isDivisionHead = userRole === "division_head";

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* Overlay Gelap untuk Mobile apabila Sidebar dibuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#003B73] text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex h-20 items-center justify-center border-b border-[#002f5c] px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#003B73] shadow-sm">
              K
            </div>
            <span className="text-xl font-bold tracking-wide">KSU Direct</span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          
          {/* Menu Papan Pemuka */}
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-[#002f5c] text-white shadow-inner"
                : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Papan Pemuka Utama
          </Link>

          {/* BAHAGIAN MENU TINDAKAN (Semua Pengguna boleh lihat) */}
          <div className="pt-4 pb-1">
            <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Tindakan
            </p>
          </div>

          <Link
            href="/pengguna/hantar-cadangan"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              pathname === "/pengguna/hantar-cadangan"
                ? "bg-[#002f5c] text-white shadow-inner"
                : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Hantar Cadangan Baru
          </Link>

          <Link
            href="/pengguna/semak-cadangan"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              pathname.startsWith("/pengguna/semak-cadangan")
                ? "bg-[#002f5c] text-white shadow-inner"
                : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Semak Status Cadangan
          </Link>

          {/* BAHAGIAN MENU BAHAGIAN - HANYA DIPAPARKAN KEPADA KETUA BAHAGIAN */}
          {isDivisionHead && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Pengurusan Bahagian
                </p>
              </div>

              <Link
                href="/bahagian/tugasan"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/bahagian/tugasan")
                    ? "bg-[#002f5c] text-white shadow-inner"
                    : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Peti Masuk Tugasan
              </Link>
            </>
          )}

          {/* BAHAGIAN MENU ADMIN - HANYA DIPAPARKAN JIKA ROLE SESUAI */}
          {isAdminOrManagement && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Pengurusan Admin
                </p>
              </div>

              <Link
                href="/admin/papan-pemuka"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/papan-pemuka")
                    ? "bg-[#002f5c] text-white shadow-inner"
                    : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Dashboard Eksekutif
              </Link>

              <Link
                href="/admin/peti-masuk"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/peti-masuk")
                    ? "bg-[#002f5c] text-white shadow-inner"
                    : "text-blue-100 hover:bg-[#002f5c] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Peti Masuk Semakan
              </Link>
            </>
          )}

        </nav>
      </aside>

      {/* Bahagian Kanan (Navbar & Kandungan) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Navbar */}
        <header className="flex h-20 shrink-0 items-center justify-between bg-white px-6 shadow-sm border-b border-slate-200 z-30">
          
          {/* Butang Hamburger (Hanya untuk Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Kosong di kiri untuk jarak bila di desktop */}
          <div className="hidden md:block"></div>

          {/* Profil Pengguna & Dropdown (Kanan) */}
          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            
            {/* Teks Nama & Peranan (Disembunyikan pada skrin sangat kecil) */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-500">{currentRole}</p>
            </div>

            {/* Butang Imej Profil */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-blue-100 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2"
            >
              {/* Fallback avatar jika tiada gambar menggunakan huruf pertama nama */}
              <span className="text-lg font-bold text-[#003B73]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>

            {/* Kotak Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in zoom-in duration-200">
                
                {/* Info profil ringkas di dalam dropdown untuk paparan mobile */}
                <div className="block border-b border-slate-100 px-4 py-3 sm:hidden">
                  <p className="text-sm font-semibold text-slate-700 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{currentRole}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Ruang Kandungan Utama */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}