"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaparCadangan() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const result = await res.json();
        if (result.status === "success") {
          setData(result.data);
        } else {
          router.push("/pengguna/semak-cadangan");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-body">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A1F3D] border-t-transparent shadow-sm"></div>
        <p className="mt-4 text-sm font-medium text-[#64748B]">Memuatkan butiran...</p>
      </div>
    );
    
  if (!data) return null;

  // ==========================================
  // LANGKAH A: Objek Warna Status
  // ==========================================
  const statusStyles: Record<string, string> = {
    "Draft": "border-slate-200 bg-slate-100 text-slate-600",
    "Baharu": "border-blue-200 bg-blue-50 text-blue-700",
    "Telah Dipanjangkan ke Bahagian": "border-indigo-200 bg-indigo-50 text-indigo-700",
    "Dalam Tindakan": "border-[#E5D3A8] bg-[#FBF3E3] text-[#8A6A22]",
    "Dikembalikan": "border-orange-200 bg-orange-50 text-orange-700",
    "Semak Semula": "border-rose-200 bg-rose-50 text-rose-700",
    "Selesai": "border-[#CDE9DA] bg-[#EAF6EF] text-[#0F6B41]",
    "Tiada Tindakan Lanjut": "border-zinc-300 bg-zinc-100 text-zinc-700",
  };

  const currentStyle = statusStyles[data.status] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <div className="mx-auto p-4 font-body md:p-8">
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

      {/* HEADER DENGAN BUTANG KEMASKINI */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/pengguna/semak-cadangan"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A1F3D]/[0.08] text-[#0A1F3D] transition-colors hover:bg-[#0A1F3D]/[0.14] md:h-10 md:w-10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E]">Cadangan</p>
            <h1 className="font-display text-xl font-semibold text-[#0A1F3D] md:text-2xl">Perincian Cadangan</h1>
          </div>
        </div>

        {/* LOGIK BARU: Butang keluar jika status bukan Selesai atau Ditutup */}
        {data.status !== "Selesai" && data.status !== "Ditutup" && data.status !== "Tiada Keperluan Tindakan Lanjut" && (
          <Link
            href={`/pengguna/kemaskini-cadangan/${data.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C6A15B] px-6 py-3 text-sm font-semibold text-[#0A1F3D] shadow-sm transition-colors hover:bg-[#D4B274] sm:w-auto md:py-2.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {data.status === "Draft" ? "Kemaskini Draf" : "Kemaskini Cadangan"}
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#E5E0D3] bg-white p-5 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#E5E0D3] pb-6 sm:flex-row sm:items-start sm:justify-between md:mb-8">
          <div>
            <p className="mb-1 text-xs font-medium text-[#64748B] md:text-sm">Nombor Rujukan</p>
            <p className="font-display text-lg font-semibold text-[#0A1F3D] md:text-xl">
              {data.reference_no || "DRAF"}
            </p>
          </div>
          
          {/* LANGKAH B: Paparan Lencana Status */}
          <div className="sm:text-right">
            <p className="mb-1.5 text-xs font-medium text-[#64748B] md:mb-1 md:text-sm">Status</p>
            <span className={`inline-block rounded-full border px-4 py-1.5 text-xs font-bold md:py-1 md:text-sm shadow-sm ${currentStyle}`}>
              {data.status === "Draft" ? "Draf" : data.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-1 text-xs font-medium text-[#64748B] md:text-sm">Kategori</p>
            <p className="text-sm font-medium text-[#1F2937] md:text-base">{data.category}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-[#64748B] md:text-sm">Tajuk</p>
            <p className="font-display text-base font-semibold text-[#0A1F3D] md:text-lg">{data.title}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[#64748B] md:text-sm">Penerangan / Justifikasi</p>
            <div className="whitespace-pre-wrap rounded-lg border border-[#E5E0D3] bg-[#F2EEE4] p-4 text-sm leading-relaxed text-[#1F2937] md:text-base">
              {data.description}
            </div>
          </div>

          {data.attachment && (
            <div>
              <p className="mb-2 text-xs font-medium text-[#64748B] md:text-sm">Lampiran Dokumen</p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${data.attachment}`}
                target="_blank"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A1F3D]/[0.06] px-4 py-3 text-sm font-semibold text-[#0A1F3D] transition-colors hover:bg-[#0A1F3D]/[0.12] sm:w-auto md:py-2"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <span className="max-w-[200px] truncate sm:max-w-xs">Muat Turun Fail</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}