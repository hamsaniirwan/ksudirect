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

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Hadkan 12 kad satu page

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bahagian/tasks`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });
        
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
      case "Telah Dipanjangkan": 
        return <span className="rounded-full bg-[#EAF0F8] px-3 py-1 text-xs font-semibold text-[#0A1F3D] border border-[#D6E1EF]">Baharu</span>;
      case "Dalam Tindakan": 
        return <span className="rounded-full bg-[#FBF3E3] px-3 py-1 text-xs font-semibold text-[#8A6A22] border border-[#E5D3A8]">Dalam Tindakan</span>;
      case "Semak Semula": 
        return <span className="rounded-full bg-[#FEF3F2] px-3 py-1 text-xs font-semibold text-[#B42318] border border-[#FDA29B] animate-pulse">Semak Semula</span>;
      case "Dikembalikan": 
        return <span className="rounded-full bg-[#EDE9DD] px-3 py-1 text-xs font-semibold text-[#6B7280] border border-[#DDD7C7]">Dikembalikan</span>;
      case "Selesai": 
      case "Ditutup":
        return <span className="rounded-full bg-[#EAF6EF] px-3 py-1 text-xs font-semibold text-[#0F6B41] border border-[#CDE9DA]">{status}</span>;
      default: 
        return <span className="rounded-full bg-[#F2EEE4] px-3 py-1 text-xs font-semibold text-[#4B5563] border border-[#E5E0D3]">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 mx-auto bg-[#F2EEE4]/40 min-h-screen font-body">
      {/* Google Fonts: institutional serif for headings, technical sans for UI */}
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

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E] mb-2">Bahagian / Agensi</p>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#0A1F3D] tracking-tight">Peti Masuk Tugasan</h1>
        <p className="mt-2 text-sm text-[#64748B]">Urus dan kemas kini tindakan bagi cadangan yang disalurkan ke Bahagian anda.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-[#FEF3F2] p-4 text-sm text-[#B42318] border border-[#FDA29B]">
          {errorMsg}
        </div>
      )}

      {/* Bahagian Filter & Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-[#E5E0D3] shadow-sm">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari tajuk atau no. rujukan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DDD7C7] text-sm focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D] outline-none transition-colors"
          />
        </div>
        
        <div className="md:w-64 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#DDD7C7] text-sm focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D] outline-none transition-colors bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Telah Dipanjangkan">Baharu (Telah Dipanjangkan)</option>
            <option value="Semak Semula">Semak Semula (Pemulangan KSU)</option>
            <option value="Dalam Tindakan">Dalam Tindakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Dikembalikan">Dikembalikan</option>
            <option value="Ditutup">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Grid Kad Tugasan */}
      {loading ? (
        <div className="text-center py-12 text-[#64748B]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0A1F3D] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 font-medium">Sedang memuatkan tugasan...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#DDD7C7]">
          <svg className="mx-auto h-12 w-12 text-[#DDD7C7] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-[#64748B] font-medium">Tiada tugasan dijumpai.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((item) => (
              <div key={item.id} className="group flex flex-col bg-white rounded-2xl border border-[#E5E0D3] shadow-sm hover:shadow-md hover:border-[#C6A15B]/50 transition-all overflow-hidden">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold tracking-wider text-[#94A3B8]">
                      {item.reference_no}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <h3 className="font-display text-lg font-semibold text-[#0A1F3D] leading-tight mb-2 group-hover:text-[#0F2A4D] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-[#E5E0D3] flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">
                      Dikemas kini: {new Date(item.updated_at).toLocaleDateString("ms-MY")}
                    </span>
                    
                    <Link 
                      href={`/bahagian/tugasan/${item.id}`} 
                      className={`flex items-center gap-1 text-sm font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${item.status === 'Semak Semula' ? 'bg-[#B42318] hover:bg-[#96190F]' : 'bg-[#0A1F3D] hover:bg-[#0F2A4D]'}`}
                    >
                      Tindakan
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
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E0D3] pt-6 gap-4">
              <span className="text-sm text-[#64748B]">
                Papar <span className="font-semibold text-[#1F2937]">{startIndex + 1}</span> hingga <span className="font-semibold text-[#1F2937]">{Math.min(endIndex, filteredData.length)}</span> daripada <span className="font-semibold text-[#1F2937]">{filteredData.length}</span> tugasan
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#DDD7C7] rounded-lg hover:bg-[#F2EEE4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Sebelumnya
                </button>
                
                <span className="px-4 py-2 text-sm font-semibold text-[#1F2937] bg-[#F2EEE4] rounded-lg border border-[#E5E0D3]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-semibold text-[#0A1F3D] bg-white border border-[#DDD7C7] rounded-lg hover:bg-[#0A1F3D]/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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