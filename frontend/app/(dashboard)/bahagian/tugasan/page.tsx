"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  id: number;
  reference_no: string | null;
  title: string;
  category: string;
  status: string;
  updated_at: string;
};

export default function PetiMasukBahagian() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bahagian/tasks`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" // WAJIB ADA: Beritahu Laravel supaya sentiasa pulangkan JSON
          }
        });
        
        // Semak jika response bukan JSON (sebagai langkah berjaga-jaga)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Pangkalan pelayan (Server) tidak memulangkan format JSON. Pastikan route API wujud.");
        }

        const result = await res.json();
        
        if (res.ok && result.status === "success") {
          setData(result.data);
        } else {
          setErrorMsg(result.message || "Gagal memuatkan data. Sila semak pangkalan pelayan.");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setErrorMsg(err.message || "Ralat sistem. Tidak dapat berhubung dengan pangkalan pelayan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) || 
      (item.reference_no && item.reference_no.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Telah Dipanjangkan": 
        return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003B73] border border-blue-200">Baharu</span>;
      case "Dalam Tindakan": 
        return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-200">Dalam Tindakan</span>;
      case "Selesai": 
      case "Ditutup":
        return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">{status}</span>;
      default: 
        return <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Peti Masuk Tugasan</h1>
        <p className="mt-1 text-sm text-slate-500">Urus dan kemas kini tindakan bagi cadangan yang disalurkan ke Bahagian anda.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Bahagian Filter & Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari tajuk atau no. rujukan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors"
          />
        </div>
        
        <div className="md:w-64 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Telah Dipanjangkan">Baharu (Telah Dipanjangkan)</option>
            <option value="Dalam Tindakan">Dalam Tindakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditutup">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Grid Kad Tugasan */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#003B73] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 font-medium">Sedang memuatkan tugasan...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-slate-500 font-medium">Tiada tugasan dijumpai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#003B73] transition-all overflow-hidden">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold tracking-wider text-slate-400">
                    {item.reference_no}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-[#003B73] transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Dikemas kini: {new Date(item.updated_at).toLocaleDateString("ms-MY")}
                  </span>
                  
                  <Link 
                    href={`/bahagian/tugasan/${item.id}`} 
                    className="flex items-center gap-1 text-sm font-semibold text-white bg-[#003B73] px-3 py-1.5 rounded-lg hover:bg-[#002f5c]"
                  >
                    Tindakan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}