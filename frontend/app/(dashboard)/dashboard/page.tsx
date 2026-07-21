"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    // Ambil data profil dari local storage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name);
      setUserRole(parsedData.role);
    }

    // TODO: Nanti kita letak fungsi fetch() di sini untuk panggil API Laravel
    // dan gantikan nombor hardcoded dengan data live.
  }, []);

  const roleDisplay: Record<string, string> = {
    user: "Pegawai MOT",
    special_officer: "Pegawai Khas KSU",
    ksu: "Ketua Setiausaha",
    division_head: "Ketua Bahagian",
    admin: "Pentadbir Sistem",
  };

  const currentRole = roleDisplay[userRole] || "Pengguna";

  return (
    <div className="p-8">
      
      {/* HEADER DASHBOARD */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Papan Pemuka Utama</h1>
        <p className="mt-1 text-slate-500">
          Selamat datang kembali, <span className="font-semibold text-slate-700">{userName}</span> ({currentRole}).
        </p>
      </div>

      {/* RENDER STATISTIK MENGIKUT PERANAN */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* =========================================
            PAPARAN 1: PEGAWAI MOT (USER BIASA)
        ========================================= */}
        {userRole === "user" && (
          <>
            <StatCard title="Cadangan Dihantar" value="5" color="blue" />
            <StatCard title="Menunggu Semakan" value="2" color="amber" />
            <StatCard title="Dalam Tindakan Bahagian" value="1" color="indigo" />
            <StatCard title="Selesai / Ditutup" value="2" color="emerald" />
          </>
        )}

        {/* =========================================
            PAPARAN 2: PEJABAT KSU (KSU & PEGAWAI KHAS)
        ========================================= */}
        {["ksu", "special_officer"].includes(userRole) && (
          <>
            <StatCard title="Total Cadangan Masuk" value="124" color="blue" />
            <StatCard title="Tindakan KSU (Pending)" value="12" color="red" />
            <StatCard title="Dipanjangkan ke Bahagian" value="45" color="amber" />
            <StatCard title="Keseluruhan Selesai" value="67" color="emerald" />
          </>
        )}

        {/* =========================================
            PAPARAN 3: KETUA BAHAGIAN
        ========================================= */}
        {userRole === "division_head" && (
          <>
            <StatCard title="Tugasan Baharu (Pending)" value="4" color="red" />
            <StatCard title="Sedang Bertindak" value="8" color="amber" />
            <StatCard title="Tugasan Selesai" value="32" color="emerald" />
          </>
        )}

        {/* =========================================
            PAPARAN 4: PENTADBIR SISTEM (ADMIN)
        ========================================= */}
        {userRole === "admin" && (
          <>
            <StatCard title="Jumlah Pengguna" value="1,204" color="indigo" />
            <StatCard title="Akaun Ketua Bahagian" value="18" color="blue" />
            <StatCard title="Log Ralat (Errors)" value="0" color="emerald" />
          </>
        )}
      </div>
      
      {/* RUANG TINDAKAN PINTAS (CALL TO ACTION) */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ruang Kerja Anda Telah Bersedia</h3>
          <p className="mt-1 text-slate-500">
            {userRole === "user" 
              ? "Ada idea baharu untuk kementerian? Hantarkan cadangan anda sekarang." 
              : "Sila rujuk menu di sebelah kiri untuk menguruskan peti masuk dan tugasan anda."}
          </p>
        </div>
        
        {/* Butang Pintas Khusus untuk Pegawai MOT */}
        {userRole === "user" && (
          <Link 
            href="/pengguna/hantar-cadangan" 
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#003B73] text-white px-6 py-3 rounded-xl hover:bg-[#002f5c] transition-colors font-medium shadow-md"
          >
            Hantar Cadangan Baharu
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// KOMPONEN REUSABLE UNTUK KAD STATISTIK (Supaya kod tak bersepah)
// -------------------------------------------------------------
function StatCard({ title, value, color }: { title: string, value: string | number, color: string }) {
  
  // Konfigurasi warna mengikut tema
  const colorStyles: Record<string, { bg: string, text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
  };

  const selectedColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${selectedColor.text}`}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
          {/* Ikon generic untuk semua kad */}
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}