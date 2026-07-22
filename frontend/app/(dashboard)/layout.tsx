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
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    const handleUserActivity = () => {
      resetIdleTimer(); // Kira semula 15 minit dari awal jika user ada buat pergerakan
    };

    // Pasang alat pendengar (event listeners)
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Mulakan kiraan pertama kali masuk
    resetIdleTimer();

    // Pembersihan sistem (cleanup) apabila pengguna keluar
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name);
      setUserRole(parsedData.role || "pengguna"); // Tambah fallback 'pengguna'
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
    pengguna: "Pegawai MOT",
    officer: "Pegawai MOT",
    special_officer: "Pegawai Khas KSU",
    pegawai_khas: "Pegawai Khas KSU",
    ksu: "Ketua Setiausaha",
    division_head: "Ketua Bahagian",
    bahagian: "Ketua Bahagian",
    admin: "Pentadbir Sistem",
  };
  const currentRole = roleDisplay[userRole] || "Pengguna";

  // Kemaskini senarai semakan role supaya menepati format baru
  const isAdminOrManagement = ["admin", "ksu", "special_officer", "pegawai_khas"].includes(userRole);
  const isDivisionHead = ["division_head", "bahagian"].includes(userRole);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F2EEE4] font-body">
      {/* Google Fonts: institutional serif for the wordmark/headings, technical sans for UI */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Fraunces", ui-serif, Georgia, serif;
          font-optical-sizing: auto;
        }
        .font-body {
          font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0A1F3D]/50 backdrop-blur-[2px] transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0A1F3D] text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Faint security-pattern watermark, consistent with the login screen */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 260 800"
          aria-hidden="true"
        >
          <defs>
            <pattern id="sidebar-guilloche" width="90" height="42" patternUnits="userSpaceOnUse">
              <path d="M0,21 C22,0 22,42 45,21 C67,0 67,42 90,21" fill="none" stroke="#C6A15B" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="260" height="800" fill="url(#sidebar-guilloche)" />
        </svg>

        <div className="relative z-10 flex h-20 shrink-0 items-center justify-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
              <Image
                src="/logo/jata_negara.png"
                alt="Logo Jata Negara"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-display text-xl font-semibold tracking-wide text-[#F7F5EF]">
              KSU Direct
            </span>
          </div>
        </div>

        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {/* =========================================================
              MENU UTAMA (PALING ATAS)
              Jika Admin -> Papar Dashboard Eksekutif
              Jika Bukan -> Papar Papan Pemuka Utama Biasa
          ========================================================= */}
          {!isAdminOrManagement ? (
            <Link
              href="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "border-[#C6A15B] bg-white/[0.06] text-white"
                  : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Papan Pemuka Utama
            </Link>
          ) : (
            <Link
              href="/admin/papan-pemuka" // <-- PATH DASHBOARD EKSEKUTIF
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/papan-pemuka")
                  ? "border-[#C6A15B] bg-white/[0.06] text-white"
                  : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Dashboard Eksekutif
            </Link>
          )}

          <div className="pb-1 pt-5">
            <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C8CA8]">
              Tindakan
            </p>
          </div>

          <Link
            href="/pengguna/hantar-cadangan"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
              pathname === "/pengguna/hantar-cadangan"
                ? "border-[#C6A15B] bg-white/[0.06] text-white"
                : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Hantar Cadangan Baru
          </Link>

          <Link
            href="/pengguna/semak-cadangan"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
              pathname.startsWith("/pengguna/semak-cadangan")
                ? "border-[#C6A15B] bg-white/[0.06] text-white"
                : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Semak Status Cadangan
          </Link>

          {isDivisionHead && (
            <>
              <div className="pb-1 pt-5">
                <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C8CA8]">
                  Pengurusan Bahagian
                </p>
              </div>

              <Link
                href="/bahagian/tugasan"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/bahagian/tugasan")
                    ? "border-[#C6A15B] bg-white/[0.06] text-white"
                    : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Peti Masuk Tugasan
              </Link>
            </>
          )}

          {isAdminOrManagement && (
            <>
              <div className="pb-1 pt-5">
                <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C8CA8]">
                  Pengurusan Admin
                </p>
              </div>

              <Link
                href="/admin/peti-masuk"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/peti-masuk")
                    ? "border-[#C6A15B] bg-white/[0.06] text-white"
                    : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Peti Masuk Semakan
              </Link>

              {/* MENU PENGURUSAN PENGGUNA (HANYA UNTUK ADMIN) */}
              {userRole === "admin" && (
                <Link
                  href="/admin/pengguna"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/pengguna")
                      ? "border-[#C6A15B] bg-white/[0.06] text-white"
                      : "border-transparent text-[#B9C4D6] hover:border-[#C6A15B]/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Pengurusan Pengguna
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="relative z-10 border-t border-white/10 px-6 py-4 font-body text-[11px] text-[#7C8CA8]">
          Kementerian Pengangkutan Malaysia
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-20 shrink-0 items-center justify-between border-b border-[#E5E0D3] bg-white px-6 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-[#64748B] hover:bg-[#F2EEE4] focus:outline-none md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:block"></div>

          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#1F2937]">{userName}</p>
              <p className="text-xs text-[#94A3B8]">{currentRole}</p>
            </div>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#C6A15B]/50 bg-[#0A1F3D] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0A1F3D] focus:ring-offset-2"
            >
              <span className="font-display text-lg font-semibold text-[#F7F5EF]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="animate-in fade-in zoom-in absolute right-0 top-12 mt-2 w-48 origin-top-right rounded-xl border border-[#E5E0D3] bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 duration-200">
                <div className="block border-b border-[#E5E0D3] px-4 py-3 sm:hidden">
                  <p className="truncate text-sm font-semibold text-[#1F2937]">{userName}</p>
                  <p className="truncate text-xs text-[#94A3B8]">{currentRole}</p>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#B42318] transition-colors hover:bg-[#FEF3F2]"
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

        <main className="flex-1 overflow-y-auto bg-[#F2EEE4]">{children}</main>
      </div>

      {/* 1. MODAL PENGESAHAN LOG KELUAR BIASA */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A1F3D]/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF3F2]">
              <svg className="h-6 w-6 text-[#B42318]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h3 className="font-display mb-2 text-xl font-semibold text-[#0A1F3D]">Log Keluar</h3>
            <p className="mb-6 text-sm text-[#64748B]">Adakah anda pasti untuk log keluar?</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-[#475569] transition-colors hover:bg-[#F2EEE4]"
              >
                Kembali
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-xl bg-[#B42318] px-5 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#96190F]"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL INAKTIF (IDLE TIMEOUT) OVERLAY */}
      {showIdleModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0A1F3D]/70 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl duration-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF6E7]">
              <svg className="h-8 w-8 text-[#B08B3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="font-display mb-2 text-xl font-semibold text-[#0A1F3D]">Anda telah dilog keluar</h3>
            <p className="mb-8 text-sm leading-relaxed text-[#64748B]">
              Atas faktor keselamatan, sistem telah log keluar akaun anda secara automatik kerana tidak aktif selama 15 minit.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-xl bg-[#0A1F3D] px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#0F2A4D]"
              >
                Log Masuk Semula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}