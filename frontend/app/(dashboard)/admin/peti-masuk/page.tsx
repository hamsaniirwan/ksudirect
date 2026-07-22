"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx"; // <-- Import library Excel

type Suggestion = {
  id: number;
  reference_no: string | null;
  title: string;
  category: string;
  status: string;
  created_at: string;
  user?: {
    name: string;
  };
};

export default function AdminInbox() {
  const router = useRouter();
  const [data, setData] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" // WAJIB ADA
          }
        });
        
        // Pelindung ralat format
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Pangkalan pelayan mengalami masalah. Sila hubungi pembangun sistem.");
        }

        const result = await res.json();
        
        if (res.ok && result.status === "success") {
          setData(result.data);
        } else {
          setErrorMsg(result.message || "Gagal memuatkan data senarai.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Ralat sistem. Tidak dapat berhubung dengan pangkalan pelayan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Logik tapisan data
  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) || 
      (item.reference_no && item.reference_no.toLowerCase().includes(searchLower)) ||
      (item.user?.name && item.user.name.toLowerCase().includes(searchLower));
    
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

  // FUNGSI EXPORT KE EXCEL
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Tiada data untuk dimuat turun.");
      return;
    }

    // 1. Susun semula format data untuk Excel (Sentiasa export semua data yang ditapis, bukan takat data di page semasa)
    const excelData = filteredData.map((item, index) => ({
      "Bil.": index + 1,
      "No. Rujukan": item.reference_no || "TIADA RUJUKAN",
      "Kategori": item.category,
      "Tajuk Cadangan": item.title,
      "Dikemukakan Oleh": item.user?.name || "Pengguna Tidak Diketahui",
      "Status Semasa": item.status,
      "Tarikh Dicipta": new Date(item.created_at).toLocaleDateString("ms-MY", {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    }));

    // 2. Buat Lembaran Kerja (Worksheet) & Buku Kerja (Workbook)
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Senarai Cadangan");

    // 3. Muat Turun Fail
    XLSX.writeFile(workbook, "Senarai_Cadangan_KSU_Direct.xlsx");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": 
        return <span className="rounded-full border border-[#E5E0D3] bg-[#F2EEE4] px-3 py-1 text-xs font-semibold text-[#4B5563]">Draf</span>;
      case "Belum Diteliti": 
        return <span className="rounded-full border border-[#E5D3A8] bg-[#FBF3E3] px-3 py-1 text-xs font-semibold text-[#8A6A22]">Belum Diteliti</span>;
      case "Telah Dipanjangkan": 
        return <span className="rounded-full border border-[#D6E1EF] bg-[#EAF0F8] px-3 py-1 text-xs font-semibold text-[#0A1F3D]">Dipanjangkan</span>;
      case "Semak Semula": 
        return <span className="rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-3 py-1 text-xs font-semibold text-[#B42318]">Semak Semula</span>;
      case "Dikembalikan": 
        return <span className="rounded-full border border-[#DDD7C7] bg-[#EDE9DD] px-3 py-1 text-xs font-semibold text-[#6B7280]">Dikembalikan</span>;
      case "Selesai": 
      case "Ditutup":
        return <span className="rounded-full border border-[#CDE9DA] bg-[#EAF6EF] px-3 py-1 text-xs font-semibold text-[#0F6B41]">{status}</span>;
      default: 
        return <span className="rounded-full border border-[#E5E0D3] bg-[#F2EEE4] px-3 py-1 text-xs font-semibold text-[#4B5563]">{status}</span>;
    }
  };

  return (
    <div className="mx-auto p-6 font-body md:p-8 bg-[#F2EEE4]/40 min-h-screen">
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

      {/* Bahagian Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E]">Peti Masuk KSU Direct</p>
          <h1 className="font-display mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-[#0A1F3D]">Peti Masuk Semakan</h1>
          <p className="mt-2 text-sm text-[#64748B]">Senarai cadangan untuk semakan Pejabat KSU.</p>
        </div>
        <button 
          onClick={handleExportExcel} 
          className="hidden md:flex shrink-0 items-center gap-2 bg-[#0F6D48] border border-[#0F6D48] text-white px-5 py-2.5 rounded-lg hover:bg-[#0B5B3B] font-semibold text-sm transition-colors shadow-sm"
        >
          {/* Ikon Excel */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Muat Turun Excel
        </button>
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
            placeholder="Cari tajuk, no. rujukan atau nama penghantar..."
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
            <option value="Belum Diteliti">Belum Diteliti</option>
            <option value="Telah Dipanjangkan">Telah Dipanjangkan</option>
            <option value="Semak Semula">Semak Semula</option>
            <option value="Dikembalikan">Dikembalikan</option>
            <option value="Tiada Keperluan Tindakan Lanjut">Tiada Keperluan Tindakan Lanjut</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditutup">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Paparan Senarai (Grid Cards) */}
      {loading ? (
        <div className="text-center py-12 text-[#64748B]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0A1F3D] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 font-medium">Sedang memuatkan data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#DDD7C7]">
          <svg className="mx-auto h-12 w-12 text-[#DDD7C7] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-[#64748B] font-medium">Tiada cadangan dijumpai dalam peti masuk.</p>
          {(searchQuery || statusFilter) && (
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter(""); }}
              className="mt-2 text-sm text-[#0A1F3D] hover:underline"
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
                className="group flex flex-col bg-white rounded-2xl border border-[#E5E0D3] shadow-sm hover:shadow-md hover:border-[#C6A15B]/50 transition-all overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold tracking-wider text-[#94A3B8]">
                      {item.reference_no || "TIADA RUJUKAN"}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <h3 className="font-display text-lg font-semibold text-[#0A1F3D] leading-tight mb-4 group-hover:text-[#0F2A4D] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-[#E5E0D3] flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-0.5">Dikemukakan Oleh</span>
                      <span className="text-sm font-medium text-[#1F2937] truncate max-w-[150px]" title={item.user?.name}>
                        {item.user?.name || "Pengguna Tidak Diketahui"}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/admin/peti-masuk/${item.id}`} 
                      className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0A1F3D] bg-[#EAF0F8] px-3 py-1.5 rounded-lg hover:bg-[#0A1F3D] hover:text-white transition-colors"
                    >
                      Semak
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
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E0D3] pt-6 gap-4">
              <span className="text-sm text-[#64748B]">
                Papar <span className="font-semibold text-[#1F2937]">{startIndex + 1}</span> hingga <span className="font-semibold text-[#1F2937]">{Math.min(endIndex, filteredData.length)}</span> daripada <span className="font-semibold text-[#1F2937]">{filteredData.length}</span> rekod
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