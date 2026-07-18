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
    <div className="p-8 mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/pengguna/semak-cadangan" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Perincian Cadangan</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Nombor Rujukan</p>
            <p className="text-xl font-bold text-[#003B73]">{data.reference_no || "DRAF"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
            <span className="inline-block rounded-full bg-blue-50 border border-blue-100 px-4 py-1 text-sm font-bold text-[#003B73]">
              {data.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Kategori</p>
            <p className="text-slate-800 font-medium">{data.category}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tajuk</p>
            <p className="text-lg text-slate-800 font-semibold">{data.title}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">Penerangan / Justifikasi</p>
            <div className="rounded-lg bg-slate-50 p-4 text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
              {data.description}
            </div>
          </div>

          {data.attachment && (
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Lampiran Dokumen</p>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${data.attachment}`} 
                target="_blank" 
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-[#003B73] hover:bg-blue-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Muat Turun Fail
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}