"use client";

import Link from "next/link";
import Image from "next/image"; 
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showIdleModal, setShowIdleModal] = useState(false); // <-- State baharu untuk Modal Inaktif (Idle)
  
  // State untuk Data Pengguna
  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("user");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref untuk menyimpan data pemasa (timer)

  // LOGIK PEMANTAUAN AKTIVITI (IDLE TIMEOUT 15 MINIT)
  useEffect(() => {
    const handleAutoLogout = () => {
      // Padam token dari storan apabila 15 minit tamat
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setShowIdleModal(true); // Paparkan modal log keluar automatik
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      // Set pemasa kepada 15 Minit (15 * 60 * 1000 milisaat)
      idleTimerRef.current = setTimeout(handleAutoLogout, 15 * 60 * 1000);
    };

    // Senarai pergerakan yang dianggap sebagai 'Aktif'
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetIdleTimer(); // Kira semula 15 minit dari awal jika user ada buat pergerakan
    };

    // Pasang alat pendengar (event listeners)
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Mulakan kiraan pertama kali masuk
    resetIdleTimer();

    // Pembersihan sistem (cleanup) apabila pengguna keluar
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name);
      setUserRole(parsedData.role);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false); 
    setShowLogoutModal(true); 
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    router.push("/");
  };

  const roleDisplay: Record<string, string> = {
    user: "Pegawai MOT",
    special_officer: "Pegawai Khas KSU",
    ksu: "Ketua Setiausaha",
    division_head: "Ketua Bahagian",
    admin: "Pentadbir Sistem",
  };
  const currentRole = roleDisplay[userRole] || "Pengguna";

  const isAdminOrManagement = ["admin", "ksu", "special_officer"].includes(userRole);
  const isDivisionHead = userRole === "division_head";

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#003B73] text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-center border-b border-[#002f5c] px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm p-1">
              <Image 
                src="/logo/jata_negara.png" 
                alt="Logo Jata Negara" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-wide">KSU Direct</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          
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

      <div className="flex flex-1 flex-col overflow-hidden">
        
        <header className="flex h-20 shrink-0 items-center justify-between bg-white px-6 shadow-sm border-b border-slate-200 z-30">
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:block"></div>

          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-500">{currentRole}</p>
            </div>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-blue-100 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2"
            >
              <span className="text-lg font-bold text-[#003B73]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in zoom-in duration-200">
                
                <div className="block border-b border-slate-100 px-4 py-3 sm:hidden">
                  <p className="text-sm font-semibold text-slate-700 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{currentRole}</p>
                </div>

                <button
                  onClick={handleLogoutClick} 
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

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

      {/* 1. MODAL PENGESAHAN LOG KELUAR BIASA */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
            
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Log Keluar</h3>
            <p className="text-sm text-slate-500 mb-6">
              Adakah anda pasti untuk log keluar?
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kembali
              </button>
              <button 
                onClick={confirmLogout}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-md transition-colors"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL INAKTIF (IDLE TIMEOUT) OVERLAY */}
      {showIdleModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center animate-in zoom-in duration-300">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
              <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Anda telah dilog keluar</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Atas faktor keselamatan, sistem telah melog keluar akaun anda kerana tidak aktif selama 15 minit.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push("/")}
                className="w-full px-5 py-3 bg-[#003B73] text-white font-semibold rounded-xl hover:bg-[#002f5c] shadow-md transition-colors"
              >
                Log Masuk Semula
              </button>
              {/* <button 
                onClick={() => setShowIdleModal(false)}
                className="w-full px-5 py-3 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kembali
              </button> */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}