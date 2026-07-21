"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Suggestion = {
  id: number;
  reference_no: string | null;
  title: string;
  category: string;
  status: string;
  created_at: string;
};

export default function SemakCadangan() {
  const [data, setData] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Hadkan 12 kad satu page

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const result = await res.json();
        if (result.status === "success") setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logik tapisan data
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.reference_no && item.reference_no.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // LOGIK PAGINATION
  // ==========================================
  // Kembalikan ke page 1 jika pengguna menaip di search atau tukar filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Data yang telah dipotong untuk page semasa
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": 
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">Draf</span>;
      case "Belum Diteliti": 
        return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-200">Belum Diteliti</span>;
      case "Telah Dipanjangkan": 
        return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003B73] border border-blue-200">Telah Dipanjangkan</span>;
      case "Selesai": 
        return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">Selesai</span>;
      default: 
        return <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 mx-auto">
      
      {/* Bahagian Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Semak Cadangan</h1>
          <p className="mt-1 text-sm text-slate-500">Senarai kesemua cadangan yang anda telah cipta atau hantar.</p>
        </div>
        <Link 
          href="/pengguna/hantar-cadangan" 
          className="rounded-lg bg-[#003B73] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#002f5c] transition-colors text-center shrink-0"
        >
          + Cadangan Baharu
        </Link>
      </div>

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
            <option value="Draft">Draf</option>
            <option value="Belum Diteliti">Belum Diteliti</option>
            <option value="Telah Dipanjangkan">Telah Dipanjangkan</option>
            <option value="Tiada Keperluan Tindakan Lanjut">Tiada Keperluan Tindakan Lanjut</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Paparan Senarai (Grid Cards) */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#003B73] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 font-medium">Sedang memuatkan data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 font-medium">Tiada rekod cadangan dijumpai.</p>
          {(searchQuery || statusFilter) && (
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter(""); }}
              className="mt-2 text-sm text-[#003B73] hover:underline"
            >
              Kosongkan tapisan
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((item) => (
              <div 
                key={item.id} 
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold tracking-wider text-slate-400">
                      {item.reference_no || "TIADA RUJUKAN"}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-[#003B73] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <span className="inline-block bg-slate-50 text-slate-500 text-xs px-2 py-1 rounded w-fit mb-4">
                    {item.category}
                  </span>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("ms-MY", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                    
                    <Link 
                      href={`/pengguna/semak-cadangan/${item.id}`} 
                      className="flex items-center gap-1 text-sm font-semibold text-[#003B73] group-hover:underline"
                    >
                      Lihat
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================== */}
          {/* BUTANG PAGINATION */}
          {/* ========================================== */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6 gap-4">
              <span className="text-sm text-slate-500">
                Papar <span className="font-semibold text-slate-700">{startIndex + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(endIndex, filteredData.length)}</span> daripada <span className="font-semibold text-slate-700">{filteredData.length}</span> rekod
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Sebelumnya
                </button>
                
                <span className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-semibold text-[#003B73] bg-white border border-slate-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Seterusnya &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}