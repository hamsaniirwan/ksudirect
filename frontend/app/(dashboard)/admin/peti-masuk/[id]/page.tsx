"use client";

import { useEffect, useState } from "react";
// TAMBAH usePathname DI SINI
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PetiMasukDetail() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname(); // <-- BARIS INI YANG TERTINGGAL TADI
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      
      // Jika tiada token, suruh log masuk BESERTA URL INI
      if (!token) {
        router.push(`/?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox/${id}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Sesi anda mungkin telah luput atau tiada kebenaran akses. Sila log keluar dan log masuk semula.");
        }

        const result = await res.json();
        
        if (res.ok && result.status === "success") {
          setData(result.data);
        } else if (res.status === 401 || res.status === 403) {
          setErrorMsg("Akses ditolak. Pastikan anda log masuk sebagai Pegawai Khas atau KSU.");
        } else {
          setErrorMsg(result.message || "Gagal memuatkan data cadangan.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Ralat sistem. Tidak dapat berhubung dengan pangkalan pelayan.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router, pathname]);

  const submitDecision = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox/${id}/decision`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ action: actionType, division_id: selectedDivision, remarks })
      });
      
      if (res.ok) {
        setShowModal(false);
        window.location.reload(); 
      } else {
        const result = await res.json();
        alert(result.message || "Gagal menyimpan keputusan.");
      }
    } catch (err) {
      console.error(err);
      alert("Berlaku ralat sistem semasa menyimpan keputusan.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan data...</div>;
  
  if (errorMsg) return (
    <div className="p-8 mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold mb-2">Akses Dihalang</h3>
        <p className="mb-4">{errorMsg}</p>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Kembali ke Log Masuk
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-8 mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/peti-masuk" className="text-slate-500 hover:text-[#003B73]">
            &larr; Kembali
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Semakan Cadangan</h1>
        </div>
        
        {data.suggestion.status === "Belum Diteliti" && (
          <div className="flex gap-3">
            <button 
              onClick={() => { setActionType("abaikan"); setShowModal(true); }}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Tiada Tindakan Lanjut
            </button>
            <button 
              onClick={() => { setActionType("panjangkan"); setShowModal(true); }}
              className="px-4 py-2 bg-[#003B73] text-white font-semibold rounded-lg hover:bg-[#002f5c] shadow-sm transition-colors"
            >
              Panjangkan ke Bahagian
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">No. Rujukan</p>
            <p className="text-lg font-bold text-[#003B73]">{data.suggestion.reference_no}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1 text-right">Status Semasa</p>
            <p className="font-semibold text-slate-800">{data.suggestion.status}</p>
          </div>
        </div>
        <hr className="mb-6 border-slate-100" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">{data.suggestion.title}</h2>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{data.suggestion.description}</p>
        
        {data.suggestion.attachment && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${data.suggestion.attachment}`} target="_blank" className="inline-flex items-center gap-2 text-sm text-[#003B73] font-semibold hover:underline">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Lihat Lampiran Dokumen
              </a>
            </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">Jejak Audit</h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {data.audit_trails.map((trail: any) => (
          <div key={trail.id} className="flex gap-4 items-start border-l-2 border-blue-200 pl-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{trail.action}</p>
              <p className="text-xs text-slate-500">
                Oleh: {trail.user?.name} pada {new Date(trail.created_at).toLocaleString('ms-MY')}
              </p>
              {trail.remarks && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded italic">"{trail.remarks}"</p>}
            </div>
          </div>
        ))}
        {data.audit_trails.length === 0 && <p className="text-sm text-slate-500">Tiada rekod audit setakat ini.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {actionType === 'panjangkan' ? 'Panjangkan Tindakan' : 'Abaikan Cadangan'}
            </h3>
            
            {actionType === 'panjangkan' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Pilih Bahagian/Unit MOT</label>
                <select 
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#003B73]"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                >
                  <option value="">-- Pilih Bahagian --</option>
                  {data.divisions.map((div: any) => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Ulasan (Pilihan)</label>
              <textarea 
                className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#003B73]" rows={3}
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
                placeholder="Masukkan nota tambahan..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={submitDecision} className="px-5 py-2 bg-[#003B73] text-white font-medium rounded-lg hover:bg-[#002f5c] shadow-sm">Sahkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}