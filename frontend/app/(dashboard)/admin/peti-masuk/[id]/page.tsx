"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PetiMasukDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // 'panjangkan' atau 'abaikan'
  const [selectedDivision, setSelectedDivision] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status === "success") setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const submitDecision = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox/${id}/decision`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: actionType, division_id: selectedDivision, remarks })
      });
      if (res.ok) {
        setShowModal(false);
        router.refresh(); // Reload data
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan data...</div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
              className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200"
            >
              Tiada Tindakan Lanjut
            </button>
            <button 
              onClick={() => { setActionType("panjangkan"); setShowModal(true); }}
              className="px-4 py-2 bg-[#003B73] text-white font-semibold rounded-lg hover:bg-[#002f5c] shadow-sm"
            >
              Panjangkan ke Bahagian
            </button>
          </div>
        )}
      </div>

      {/* Maklumat Cadangan */}
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
        <p className="text-slate-700 whitespace-pre-wrap">{data.suggestion.description}</p>
      </div>

      {/* Jejak Audit (FR-012) */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Jejak Audit</h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {data.audit_trails.map((trail: any) => (
          <div key={trail.id} className="flex gap-4 items-start border-l-2 border-blue-200 pl-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{trail.action}</p>
              <p className="text-xs text-slate-500">
                Oleh: {trail.user?.name} pada {new Date(trail.created_at).toLocaleString('ms-MY')}
              </p>
              {trail.remarks && <p className="text-sm text-slate-600 mt-1 italic">"{trail.remarks}"</p>}
            </div>
          </div>
        ))}
        {data.audit_trails.length === 0 && <p className="text-sm text-slate-500">Tiada rekod audit.</p>}
      </div>

      {/* Modal Keputusan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {actionType === 'panjangkan' ? 'Panjangkan Tindakan' : 'Abaikan Cadangan'}
            </h3>
            
            {actionType === 'panjangkan' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Pilih Bahagian/Unit MOT</label>
                <select 
                  className="w-full border p-2 rounded-lg"
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
                className="w-full border p-2 rounded-lg" rows={3}
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">Batal</button>
              <button onClick={submitDecision} className="px-4 py-2 bg-[#003B73] text-white rounded-lg">Sahkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}