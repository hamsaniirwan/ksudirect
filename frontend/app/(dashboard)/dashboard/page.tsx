"use client";

import { useEffect, useState } from "react";

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
  }, []);

  // Format peranan untuk paparan yang lebih kemas
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
      
      {/* Header Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Papan Pemuka</h1>
        <p className="mt-1 text-slate-500">
          Selamat datang kembali, <span className="font-semibold text-slate-700">{userName}</span> ({currentRole}).
        </p>
      </div>

      {/* Kad Statistik (Placeholder berdasarkan SRS) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Kad 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Jumlah Cadangan</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">124</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003B73]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kad 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Menunggu Semakan</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kad 3 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Telah Dipanjangkan</p>
              <p className="mt-2 text-3xl font-bold text-[#003B73]">45</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003B73]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kad 4 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Selesai Ditutup</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">67</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
      
      {/* Ruang untuk komponen seterusnya */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-medium text-slate-800">Ruang Kerja Anda Telah Bersedia</h3>
        <p className="mt-2 text-slate-500">Pilih menu di sebelah kiri untuk mula menguruskan cadangan penambahbaikan.</p>
      </div>

    </div>
  );
}