"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  division_id: number | null;
  division?: { id: number; name: string };
};

type Division = {
  id: number;
  name: string;
};

export default function PengurusanPengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States untuk Modal Borang
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState({ id: 0, name: "", email: "", role: "user", division_id: "" });
  const [formError, setFormError] = useState("");

  // States untuk Modal Buang
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch Data Awal
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // 1. Dapatkan senarai pengguna
      const resUsers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const dataUsers = await resUsers.json();
      if (resUsers.ok) setUsers(dataUsers.data);

      // 2. Dapatkan senarai bahagian (untuk dropdown)
      // Pastikan ada endpoint /divisions di backend kau
      const resDivs = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/divisions`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const dataDivs = await resDivs.json();
      if (resDivs.ok) setDivisions(dataDivs.data || dataDivs);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi Tambah/Kemaskini
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (formData.role === "division_head" && !formData.division_id) {
      setFormError("Sila pilih Bahagian bagi Ketua Bahagian.");
      return;
    }

    const token = localStorage.getItem("token");
    const url = modalMode === "add" 
      ? `${process.env.NEXT_PUBLIC_API_URL}/users` 
      : `${process.env.NEXT_PUBLIC_API_URL}/users/${formData.id}`;
    
    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          division_id: formData.division_id || null,
        })
      });

      const result = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchData(); // Refresh table
      } else {
        setFormError(result.message || "Gagal menyimpan maklumat pengguna.");
      }
    } catch (err) {
      setFormError("Berlaku ralat sistem.");
    }
  };

  // Fungsi Padam
  const handleDelete = async () => {
    if (!userToDelete) return;
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      
      if (res.ok) {
        setShowDeleteModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: 0, name: "", email: "", role: "user", division_id: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setFormData({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      division_id: user.division_id ? user.division_id.toString() : "" 
    });
    setFormError("");
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "admin": return <span className="bg-[#0A1F3D] text-white px-3 py-1 rounded-full text-xs font-bold">Pentadbir</span>;
      case "ksu": return <span className="bg-[#F5E6E6] text-[#7A2E2E] px-3 py-1 rounded-full text-xs font-bold border border-[#E8CFCF]">KSU</span>;
      case "special_officer": return <span className="bg-[#FBF3E4] text-[#8A6A22] px-3 py-1 rounded-full text-xs font-bold border border-[#E5D3A8]">Pegawai Khas</span>;
      case "division_head": return <span className="bg-[#EAF0F8] text-[#0A1F3D] px-3 py-1 rounded-full text-xs font-bold border border-[#D6E1EF]">Ketua Bahagian</span>;
      default: return <span className="bg-[#F2EEE4] text-[#4B5563] px-3 py-1 rounded-full text-xs font-bold border border-[#E5E0D3]">Pengguna Biasa</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 mx-auto min-h-screen bg-[#F2EEE4]/40 font-body">
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

      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E] mb-2">Tadbir Urus Sistem</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#0A1F3D] tracking-tight">Pengurusan Akses & Pengguna</h1>
          <p className="mt-2 text-sm text-[#64748B]">Urus peranan pegawai dan tetapkan tahap akses sistem.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#0A1F3D] text-white px-5 py-2.5 rounded-xl hover:bg-[#0F2A4D] transition-colors font-semibold shadow-md flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tambah Pengguna
        </button>
      </div>

      {/* FILTER & TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E0D3] flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau e-mel pegawai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD7C7] text-sm focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#475569]">
            <thead className="bg-[#F7F5EF] text-[#64748B] font-semibold border-b border-[#E5E0D3]">
              <tr>
                <th className="px-6 py-4 uppercase text-xs tracking-wider">Nama Pegawai</th>
                <th className="px-6 py-4 uppercase text-xs tracking-wider">Peranan / Akses</th>
                <th className="px-6 py-4 uppercase text-xs tracking-wider">Jabatan / Bahagian</th>
                <th className="px-6 py-4 text-right uppercase text-xs tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D3]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-[#94A3B8]">Memuatkan data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-[#94A3B8]">Tiada pengguna dijumpai.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#0A1F3D]">{user.name}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-[#64748B] font-medium">
                      {user.role === 'division_head' && user.division ? user.division.name : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(user)} className="text-[#0A1F3D] hover:underline font-semibold mr-4 transition-colors">Edit</button>
                      <button onClick={() => { setUserToDelete(user.id); setShowDeleteModal(true); }} className="text-[#B42318] hover:underline font-semibold transition-colors">Padam</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH/KEMASKINI */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-[#E5E0D3] animate-in zoom-in duration-200">
            <h3 className="font-display text-xl font-semibold text-[#0A1F3D] mb-6">
              {modalMode === 'add' ? 'Tambah Pengguna Baru' : 'Kemaskini Akses Pengguna'}
            </h3>

            {formError && (
              <div className="mb-6 rounded-lg bg-[#FEF3F2] p-3 text-sm text-[#B42318] border border-[#FDA29B]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1F2937] mb-2">Nama Penuh</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-[#DDD7C7] p-2.5 rounded-lg outline-none focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1F2937] mb-2">E-mel Rasmi (SSO)</label>
                <input 
                  type="email" required
                  disabled={modalMode === 'edit'} // Emel SSO tak digalakkan diubah setelah didaftar
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full border p-2.5 rounded-lg outline-none ${modalMode === 'edit' ? 'bg-[#F2EEE4] border-[#E5E0D3] text-[#94A3B8]' : 'border-[#DDD7C7] focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1F2937] mb-2">Peranan (Role)</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value, division_id: ""})}
                  className="w-full border border-[#DDD7C7] p-2.5 rounded-lg outline-none focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D] bg-white"
                >
                  <option value="user">Pengguna Biasa (Pegawai MOT)</option>
                  <option value="division_head">Ketua Bahagian</option>
                  <option value="special_officer">Pegawai Khas KSU</option>
                  <option value="ksu">Ketua Setiausaha (KSU)</option>
                  <option value="admin">Pentadbir Sistem (Admin)</option>
                </select>
              </div>

              {formData.role === "division_head" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Tugaskan ke Bahagian</label>
                  <select 
                    value={formData.division_id} 
                    onChange={(e) => setFormData({...formData, division_id: e.target.value})}
                    className="w-full border border-[#DDD7C7] p-2.5 rounded-lg outline-none focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D] bg-white"
                  >
                    <option value="">-- Sila Pilih Bahagian --</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D3] mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[#4B5563] font-semibold bg-[#F2EEE4] hover:bg-[#EDE9DD] rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#0A1F3D] text-white font-semibold rounded-xl hover:bg-[#0F2A4D] shadow-md transition-colors">
                  Simpan Maklumat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PADAM PENGGUNA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center border border-[#E5E0D3] animate-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FEF3F2] mb-5">
              <svg className="h-8 w-8 text-[#B42318]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-[#0A1F3D] mb-2">Padam Pengguna</h3>
            <p className="text-sm text-[#64748B] mb-8 leading-relaxed">
              Adakah anda pasti? Tindakan ini akan membuang akses pengguna tersebut sepenuhnya dari sistem.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 text-[#4B5563] font-semibold bg-[#F2EEE4] hover:bg-[#EDE9DD] rounded-xl transition-colors">Batal</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-[#B42318] text-white font-semibold rounded-xl hover:bg-[#96190F] shadow-md transition-colors">Ya, Padam</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}