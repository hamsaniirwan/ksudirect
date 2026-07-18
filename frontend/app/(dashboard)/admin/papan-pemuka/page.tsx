"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status === "success") setData(result.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8 text-slate-500">Memuatkan Papan Pemuka...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Papan Pemuka Eksekutif</h1>
        <p className="text-slate-500">Ringkasan statistik cadangan penambahbaikan KSU Direct.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Jumlah Keseluruhan</p>
          <p className="text-4xl font-bold text-[#003B73] mt-2">{data.kpi.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Belum Diteliti</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{data.kpi.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Dipanjangkan</p>
          <p className="text-4xl font-bold text-blue-500 mt-2">{data.kpi.forwarded}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Selesai / Ditutup</p>
          <p className="text-4xl font-bold text-emerald-600 mt-2">{data.kpi.completed}</p>
        </div>
      </div>
      {/* Carta atau metrik trend bulanan boleh ditambah di bawah ini */}
    </div>
  );
}