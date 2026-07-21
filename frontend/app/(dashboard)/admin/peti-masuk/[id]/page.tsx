"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PetiMasukDetail() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [modalError, setModalError] = useState(""); 
  
  // Form States
  const [actionType, setActionType] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      
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

  // Semakan (Validasi) inline sebelum buka Confirm Modal
  const triggerConfirm = () => {
    if (actionType === 'panjangkan' && !selectedDivision) {
      setModalError("Sila pilih Bahagian/Unit MOT terlebih dahulu.");
      return;
    }
    // WAJIBKAN ulasan jika kes dibuka semula
    if (actionType === 'buka_semula' && !remarks.trim()) {
      setModalError("Sila masukkan sebab/ulasan mengapa kes ini dibuka semula.");
      return;
    }
    
    setModalError(""); 
    setShowConfirmModal(true); 
  };

  const submitDecision = async () => {
    setShowConfirmModal(false); 
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inbox/${id}/decision`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        // Hantar data ke backend
        body: JSON.stringify({ action: actionType, division_id: selectedDivision, remarks })
      });
      
      if (res.ok) {
        setShowModal(false);
        window.location.reload(); 
      } else {
        const result = await res.json();
        setShowModal(false);
        setErrorMsg(result.message || "Gagal menyimpan keputusan."); 
      }
    } catch (err) {
      console.error(err);
      setShowModal(false);
      setErrorMsg("Berlaku ralat sistem semasa menyimpan keputusan."); 
    }
  };

  const handleOpenModal = (type: string) => {
    setActionType(type);
    setSelectedDivision("");
    setRemarks("");
    setModalError("");
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan data...</div>;
  
  if (errorMsg) return (
    <div className="p-4 md:p-8 mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold mb-2">Peringatan Sistem</h3>
        <p className="mb-4">{errorMsg}</p>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Kembali ke Log Masuk
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    // UBAH: Kurangkan padding di mobile (p-4) dan maintain p-8 di desktop
    <div className="p-4 md:p-8 mx-auto relative">
      
      {/* UBAH: Jadikan flex-col di mobile supaya tak himpit, flex-row di desktop */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        
        <div className="flex items-center gap-3">
          <Link href="/admin/peti-masuk" className="text-slate-500 hover:text-[#003B73] shrink-0 text-sm md:text-base">
            &larr; Kembali
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Semakan Cadangan</h1>
        </div>
        
        {/* BUTANG JIKA STATUS BELUM DITELITI */}
        {data.suggestion.status === "Belum Diteliti" && (
          // UBAH: Butang jadi w-full di mobile supaya besar dan mudah ditekan
          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0">
            <button 
              onClick={() => handleOpenModal("abaikan")}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm md:text-base"
            >
              Tiada Tindakan Lanjut
            </button>
            <button 
              onClick={() => handleOpenModal("panjangkan")}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#003B73] text-white font-semibold rounded-lg hover:bg-[#002f5c] shadow-sm transition-colors text-sm md:text-base"
            >
              Panjangkan ke Bahagian
            </button>
          </div>
        )}

        {/* BUTANG JIKA STATUS SUDAH SELESAI / DITUTUP */}
        {(data.suggestion.status === "Selesai" || data.suggestion.status === "Ditutup") && (
          <div className="flex w-full md:w-auto mt-2 md:mt-0">
            <button 
              onClick={() => handleOpenModal("buka_semula")}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Buka Semula Cadangan
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
        {/* UBAH: Stack info di skrin sangat kecil (mobile) */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <p className="text-xs md:text-sm text-slate-500 mb-1">No. Rujukan</p>
            <p className="text-base md:text-lg font-bold text-[#003B73]">{data.suggestion.reference_no}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs md:text-sm text-slate-500 mb-1">Status Semasa</p>
            <p className={`font-semibold text-sm md:text-base ${data.suggestion.status === 'Semak Semula' ? 'text-amber-600' : 'text-slate-800'}`}>
              {data.suggestion.status}
            </p>
          </div>
        </div>
        
        <hr className="mb-6 border-slate-100" />
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-3">{data.suggestion.title}</h2>
        <p className="text-sm md:text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
          {data.suggestion.description}
        </p>
        
        {data.suggestion.attachment && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${data.suggestion.attachment}`} target="_blank" className="inline-flex items-center gap-2 text-sm text-[#003B73] font-semibold hover:underline">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="truncate max-w-[200px] sm:max-w-xs">Lihat Lampiran Dokumen</span>
              </a>
            </div>
        )}
      </div>

      <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">Jejak Audit</h3>
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {data.audit_trails.map((trail: any) => (
          <div key={trail.id} className="flex gap-4 items-start border-l-2 border-blue-200 pl-4">
            <div className="w-full">
              <p className="text-sm font-semibold text-slate-800">{trail.action}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Oleh: {trail.user?.name} pada {new Date(trail.created_at).toLocaleString('ms-MY')}
              </p>
              {trail.remarks && (
                <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs md:text-sm text-slate-600 italic">"{trail.remarks}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {data.audit_trails.length === 0 && <p className="text-sm text-slate-500">Tiada rekod audit setakat ini.</p>}
      </div>

      {/* MODAL 1: BORANG TINDAKAN */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-slate-800">
              {actionType === 'panjangkan' ? 'Panjangkan Tindakan' : 
               actionType === 'buka_semula' ? 'Buka Semula Kes' : 'Abaikan Cadangan'}
            </h3>

            {modalError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {modalError}
              </div>
            )}
            
            {actionType === 'panjangkan' && (
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2 text-slate-700">Pilih Bahagian/Unit MOT</label>
                <select 
                  className={`w-full border p-3 text-sm rounded-lg outline-none focus:ring-2 transition-colors bg-slate-50 ${modalError ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-blue-100 focus:border-[#003B73]'}`}
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    if (e.target.value) setModalError(""); 
                  }}
                >
                  <option value="">-- Sila Pilih --</option>
                  {data.divisions.map((div: any) => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Ulasan {actionType === 'buka_semula' && <span className="text-red-500">*</span>}
              </label>
              <textarea 
                className={`w-full border p-3 text-sm rounded-lg outline-none focus:ring-2 transition-colors bg-slate-50 ${modalError && actionType === 'buka_semula' ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-blue-100 focus:border-[#003B73]'}`} 
                rows={3}
                value={remarks} onChange={(e) => {
                  setRemarks(e.target.value);
                  if (e.target.value && actionType === 'buka_semula') setModalError("");
                }}
                placeholder={actionType === 'buka_semula' ? 'Nyatakan sebab kes ini dipulangkan semula...' : 'Masukkan nota tambahan (Pilihan)...'}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full sm:w-auto px-5 py-2.5 text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={triggerConfirm} 
                className={`w-full sm:w-auto px-5 py-2.5 text-white font-medium rounded-xl shadow-sm transition-colors ${actionType === 'buka_semula' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003B73] hover:bg-[#002f5c]'}`}
              >
                Sahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PENGESAHAN TERAKHIR */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-5">
              <svg className="h-8 w-8 text-[#003B73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Adakah anda pasti?</h3>
            <p className="text-sm md:text-base text-slate-500 mb-8 leading-relaxed">
              {actionType === 'panjangkan' 
                ? "Fail cadangan ini akan dihantar ke Bahagian yang dipilih dan tidak boleh ditarik balik." 
                : actionType === 'buka_semula'
                ? "Fail ini akan dibuka semula. Bahagian yang ditugaskan akan dimaklumkan."
                : "Fail cadangan ini akan ditutup dan tiada tindakan lanjut akan dibuat."}
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto px-6 py-3 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Kembali
              </button>
              <button 
                onClick={submitDecision}
                className="w-full sm:w-auto px-6 py-3 bg-[#003B73] text-white font-semibold rounded-xl hover:bg-[#002f5c] shadow-md transition-colors"
              >
                Ya, Teruskan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}