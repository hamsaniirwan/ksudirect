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
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
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
      case "Draf":
        return (
          <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            Draf
          </span>
        );
      case "Baharu":
        return (
          <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
            Baharu
          </span>
        );
      case "Telah Dipanjangkan ke Bahagian":
        return (
          <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">
            Telah Dipanjangkan
          </span>
        );
      case "Dalam Tindakan":
        return (
          <span className="inline-block rounded-full border border-[#E5D3A8] bg-[#FBF3E3] px-3 py-1 text-xs font-bold text-[#8A6A22] shadow-sm">
            Dalam Tindakan
          </span>
        );
      case "Dikembalikan":
        return (
          <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
            Dikembalikan
          </span>
        );
      case "Semak Semula":
        return (
          <span className="inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm animate-pulse">
            Semak Semula
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-block rounded-full border border-[#CDE9DA] bg-[#EAF6EF] px-3 py-1 text-xs font-bold text-[#0F6B41] shadow-sm">
            Selesai
          </span>
        );
      case "Tiada Tindakan Lanjut":
        return (
          <span className="inline-block rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 shadow-sm">
            Tiada Tindakan Lanjut
          </span>
        );
      default:
        return (
          <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto p-4 font-body md:p-8">
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E]">Rekod Anda</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[#0A1F3D] md:text-3xl">
            Semak Cadangan
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">Senarai kesemua cadangan yang anda telah cipta atau hantar.</p>
        </div>
        <Link
          href="/pengguna/hantar-cadangan"
          className="shrink-0 rounded-lg bg-[#0A1F3D] px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0F2A4D]"
        >
          + Cadangan Baharu
        </Link>
      </div>

      {/* Bahagian Filter & Search */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E5E0D3] bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari tajuk atau no. rujukan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#DDD7C7] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
          />
        </div>

        <div className="shrink-0 md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-[#DDD7C7] bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
          >
            <option value="">Semua Status</option>
            <option value="Draft">Draf</option>
            <option value="Baharu">Baharu</option>
            <option value="Telah Dipanjangkan ke Bahagian">Telah Dipanjangkan</option>
            <option value="Dalam Tindakan">Dalam Tindakan</option>
            <option value="Semak Semula">Semak Semula</option>
            <option value="Dikembalikan">Dikembalikan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tiada Tindakan Lanjut">Tiada Tindakan Lanjut</option>
          </select>
        </div>
      </div>

      {/* Paparan Senarai (Grid Cards) */}
      {loading ? (
        <div className="py-12 text-center text-[#64748B]">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0A1F3D] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>
          <p className="mt-4 font-medium">Sedang memuatkan data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DDD7C7] bg-white py-16 text-center">
          <svg className="mx-auto mb-3 h-12 w-12 text-[#DDD7C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="font-medium text-[#64748B]">Tiada rekod cadangan dijumpai.</p>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
              }}
              className="mt-2 text-sm text-[#0A1F3D] hover:underline"
            >
              Kosongkan tapisan
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white shadow-sm transition-all hover:border-[#C6A15B]/50 hover:shadow-md"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#94A3B8]">
                      {item.reference_no || "TIADA RUJUKAN"}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="font-display mb-2 line-clamp-2 text-lg font-semibold leading-tight text-[#0A1F3D] transition-colors group-hover:text-[#0F2A4D]">
                    {item.title}
                  </h3>

                  <span className="mb-4 inline-block w-fit rounded bg-[#F2EEE4] px-2 py-1 text-xs text-[#64748B]">
                    {item.category}
                  </span>

                  <div className="mt-auto flex items-center justify-between border-t border-[#E5E0D3] pt-4">
                    <span className="text-xs text-[#94A3B8]">
                      {new Date(item.created_at).toLocaleDateString("ms-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <Link
                      href={`/pengguna/semak-cadangan/${item.id}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#0A1F3D] group-hover:underline"
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
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#E5E0D3] pt-6 sm:flex-row">
              <span className="text-sm text-[#64748B]">
                Papar <span className="font-semibold text-[#1F2937]">{startIndex + 1}</span> hingga{" "}
                <span className="font-semibold text-[#1F2937]">{Math.min(endIndex, filteredData.length)}</span> daripada{" "}
                <span className="font-semibold text-[#1F2937]">{filteredData.length}</span> rekod
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#DDD7C7] bg-white px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F2EEE4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &larr; Sebelumnya
                </button>

                <span className="rounded-lg border border-[#E5E0D3] bg-[#F2EEE4] px-4 py-2 text-sm font-semibold text-[#1F2937]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[#DDD7C7] bg-white px-4 py-2 text-sm font-semibold text-[#0A1F3D] transition-colors hover:bg-[#0A1F3D]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
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