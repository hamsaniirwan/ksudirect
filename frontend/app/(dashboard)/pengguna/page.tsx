"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PenggunaDashboard() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.name || "Pegawai");
  }, []);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Selamat Datang, {userName}</h1>
        <p className="mt-2 text-slate-500">Pilih tindakan anda di bawah untuk menguruskan cadangan penambahbaikan kementerian.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <Link 
          href="/pengguna/hantar-cadangan" 
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-white p-10 text-center shadow-sm transition-all hover:border-[#003B73] hover:shadow-md"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#003B73] transition-transform group-hover:scale-110">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hantar Cadangan Baharu</h2>
          <p className="mt-2 text-sm text-slate-500">Buka borang untuk menghantar idea atau penambahbaikan terus kepada KSU.</p>
        </Link>

        <Link 
          href="/pengguna/semak-cadangan" 
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-white p-10 text-center shadow-sm transition-all hover:border-[#003B73] hover:shadow-md"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-transform group-hover:scale-110">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Semak Status Cadangan</h2>
          <p className="mt-2 text-sm text-slate-500">Lihat senarai draf anda dan pantau status cadangan yang telah dihantar.</p>
        </Link>
      </div>
    </div>
  );
}