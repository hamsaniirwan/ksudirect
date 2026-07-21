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
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
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

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan butiran...</div>;
  if (!data) return null;

  return (
    // UBAH: p-4 di mobile, p-8 di desktop
    <div className="p-4 md:p-8 mx-auto max-w-5xl">
      
      {/* HEADER DENGAN BUTANG KEMASKINI (JIKA DRAF) */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/pengguna/semak-cadangan" className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Perincian Cadangan</h1>
        </div>

        {/* Butang ini hanya keluar jika status adalah Draft */}
        {data.status === "Draft" && (
          <Link 
            href={`/pengguna/kemaskini-cadangan/${data.id}`}
            // UBAH: w-full di mobile supaya butang besar dan mudah ditekan, sm:w-auto di desktop
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 md:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Kemaskini Draf
          </Link>
        )}
      </div>

      {/* UBAH: p-5 di mobile, p-8 di desktop */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
        
        {/* UBAH: flex-col di mobile supaya tak himpit, sm:flex-row di desktop */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8 pb-6 border-b border-slate-100">
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Nombor Rujukan</p>
            <p className="text-lg md:text-xl font-bold text-[#003B73]">{data.reference_no || "DRAF"}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-1.5 md:mb-1">Status</p>
            <span className={`inline-block rounded-full px-4 py-1.5 md:py-1 text-xs md:text-sm font-bold border ${data.status === 'Draft' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-100 text-[#003B73]'}`}>
              {data.status === 'Draft' ? 'Draf' : data.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Kategori</p>
            <p className="text-sm md:text-base text-slate-800 font-medium">{data.category}</p>
          </div>
          
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Tajuk</p>
            <p className="text-base md:text-lg text-slate-800 font-semibold">{data.title}</p>
          </div>

          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-2">Penerangan / Justifikasi</p>
            <div className="rounded-lg bg-slate-50 p-4 text-sm md:text-base text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
              {data.description}
            </div>
          </div>

          {data.attachment && (
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-500 mb-2">Lampiran Dokumen</p>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${data.attachment}`} 
                target="_blank" 
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 rounded-lg bg-blue-50 px-4 py-3 md:py-2 text-sm font-semibold text-[#003B73] hover:bg-blue-100 transition-colors"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="truncate max-w-[200px] sm:max-w-xs">Muat Turun Fail</span>
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}