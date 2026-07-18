"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const handlePrint = () => {
    window.print();
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) || 
      (item.reference_no && item.reference_no.toLowerCase().includes(searchLower)) ||
      (item.user?.name && item.user.name.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": 
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">Draf</span>;
      case "Belum Diteliti": 
        return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-200">Belum Diteliti</span>;
      case "Telah Dipanjangkan": 
        return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003B73] border border-blue-200">Dipanjangkan</span>;
      case "Selesai": 
        return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">Selesai</span>;
      default: 
        return <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Bahagian Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Peti Masuk Semakan</h1>
          <p className="mt-1 text-sm text-slate-500">Senarai cadangan untuk semakan Pejabat KSU.</p>
        </div>
        <button 
          onClick={handlePrint} 
          className="hidden md:flex shrink-0 items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm print:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak PDF
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Bahagian Filter & Search (Disembunyikan semasa print) */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari tajuk, no. rujukan atau nama penghantar..."
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
            <option value="Belum Diteliti">Belum Diteliti</option>
            <option value="Telah Dipanjangkan">Telah Dipanjangkan</option>
            <option value="Tiada Keperluan Tindakan Lanjut">Tiada Keperluan Tindakan Lanjut</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Paparan Senarai (Grid Cards) */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 print:hidden">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#003B73] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 font-medium">Sedang memuatkan data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed print:hidden">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-slate-500 font-medium">Tiada cadangan dijumpai dalam peti masuk.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {filteredData.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden print:break-inside-avoid print:shadow-none print:border-slate-300"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold tracking-wider text-slate-400">
                    {item.reference_no || "TIADA RUJUKAN"}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4 group-hover:text-[#003B73] transition-colors line-clamp-2 print:line-clamp-none">
                  {item.title}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Dikemukakan Oleh</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={item.user?.name}>
                      {item.user?.name || "Pengguna Tidak Diketahui"}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/admin/peti-masuk/${item.id}`} 
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#003B73] group-hover:underline bg-blue-50 px-3 py-1.5 rounded-lg print:hidden"
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
      )}
    </div>
  );
}