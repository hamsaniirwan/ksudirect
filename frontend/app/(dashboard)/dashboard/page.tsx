"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan data KPI dan Graf (nanti dipanggil dari API)
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 1. Ambil data profil dari local storage
    const userData = localStorage.getItem("user");
    let currentRole = "";
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.name);
        
        // PENTING: Jika role dari DB kosong/null, kita anggap dia pengguna/officer biasa
        currentRole = parsedData.role || "pengguna"; 
        setUserRole(currentRole);
      } catch (e) {
        console.error("Ralat membaca data pengguna:", e);
      }
    }

    // ====================================================================
    // AUTO-REDIRECT UNTUK ADMIN, KSU & PEGAWAI KHAS
    // Terus hantar mereka ke Papan Pemuka Eksekutif tanpa tunjuk page ini
    // ====================================================================
    if (["admin", "ksu", "special_officer", "pegawai_khas"].includes(currentRole)) {
        router.push("/admin/papan-pemuka"); // Redirect ke papan pemuka eksekutif
        return; // Hentikan execution di sini supaya graf tak cuba load
    }

    // 2. Fetch Data (MOCK DATA UNTUK SEMENTARA WAKTU)
    // Nanti kau boleh gantikan dengan fetch sebenar ke Laravel API
    setTimeout(() => {
      if (currentRole === "pengguna" || currentRole === "officer" || currentRole === "user") {
        setStats({
          kpi: { draft: 2, pending: 5, active: 1, completed: 3 },
          chart: [
            { month: "Jan", dihantar: 1, selesai: 0 },
            { month: "Feb", dihantar: 2, selesai: 1 },
            { month: "Mac", dihantar: 0, selesai: 1 },
            { month: "Apr", dihantar: 3, selesai: 0 },
            { month: "Mei", dihantar: 1, selesai: 1 },
            { month: "Jun", dihantar: 4, selesai: 2 },
          ]
        });
      } else if (currentRole === "division_head" || currentRole === "bahagian") {
        setStats({
          kpi: { new: 6, in_progress: 12, returned: 2, completed: 45 },
          chart: [
            { month: "Jan", diterima: 5, diselesaikan: 4 },
            { month: "Feb", diterima: 8, diselesaikan: 7 },
            { month: "Mac", diterima: 12, diselesaikan: 10 },
            { month: "Apr", diterima: 7, diselesaikan: 8 },
            { month: "Mei", diterima: 15, diselesaikan: 12 },
            { month: "Jun", diterima: 9, diselesaikan: 14 },
          ]
        });
      }
      setLoading(false);
    }, 800);

  }, [router]);

  const roleDisplay: Record<string, string> = {
    pengguna: "Pegawai MOT",
    officer: "Pegawai MOT",
    user: "Pegawai MOT",
    special_officer: "Pegawai Khas KSU",
    ksu: "Ketua Setiausaha",
    division_head: "Ketua Bahagian",
    bahagian: "Ketua Bahagian",
    admin: "Pentadbir Sistem",
  };

  const currentRoleName = roleDisplay[userRole] || userRole.toUpperCase() || "PEGAWAI MOT";

  // Jika tengah loading ATAU role adalah admin/ksu (sebab tengah proses nak redirect)
  if (loading || ["admin", "ksu", "special_officer", "pegawai_khas"].includes(userRole)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003B73] border-t-transparent shadow-sm"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Memuatkan ruang kerja...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 mx-auto min-h-screen">
      
      {/* HEADER DASHBOARD */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
          Papan Pemuka Utama
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-500">
          Selamat datang, <span className="font-bold text-slate-700">{userName}</span> 
          <span className="inline-block ml-2 px-2.5 py-0.5 bg-blue-50 text-[#003B73] text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
            {currentRoleName}
          </span>
        </p>
      </div>

      {/* =========================================
          PAPARAN 1: PEGAWAI MOT (USER BIASA)
      ========================================= */}
      {(userRole === "pengguna" || userRole === "officer" || userRole === "user") && stats && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Kad Call-To-Action Khusus Pengguna */}
          <div className="relative overflow-hidden rounded-2xl bg-[#003B73] p-8 md:p-10 shadow-lg border border-[#002f5c] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute -top-24 -right-24 opacity-10">
              <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5zM11 10v5h2v-5h-2zm0 7v2h2v-2h-2z"/></svg>
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ada Cadangan Penambahbaikan?</h2>
              <p className="text-blue-100 text-sm md:text-base max-w-xl">
                Setiap pandangan anda amat bernilai untuk kemajuan Kementerian Pengangkutan. Suarakan cadangan anda hari ini.
              </p>
            </div>
            <Link href="/pengguna/hantar-cadangan" className="relative z-10 shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-xl hover:bg-amber-600 transition-colors font-bold shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Cipta Cadangan Baharu
            </Link>
          </div>

          {/* Kad Statistik Pendek */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Draf Disimpan" value={stats.kpi.draft} color="slate" />
            <StatCard title="Sedang Disemak (KSU)" value={stats.kpi.pending} color="amber" />
            <StatCard title="Tindakan Bahagian" value={stats.kpi.active} color="blue" />
            <StatCard title="Selesai / Ditutup" value={stats.kpi.completed} color="emerald" />
          </div>

          {/* Graf Prestasi Pengguna */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Aktiviti Penghantaran Anda (Tahun Semasa)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                  <Bar dataKey="dihantar" name="Cadangan Dihantar" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="selesai" name="Telah Selesai" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* =========================================
          PAPARAN 2: KETUA BAHAGIAN
      ========================================= */}
      {(userRole === "division_head" || userRole === "bahagian") && stats && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Tugasan Baharu" value={stats.kpi.new} color="red" />
            <StatCard title="Dalam Tindakan" value={stats.kpi.in_progress} color="amber" />
            <StatCard title="Dikembalikan (Semak)" value={stats.kpi.returned} color="indigo" />
            <StatCard title="Tugasan Selesai" value={stats.kpi.completed} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Trend Penyelesaian Tugasan Bahagian</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDiterima" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                    <Area type="monotone" dataKey="diterima" name="Tugasan Diterima" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDiterima)" />
                    <Area type="monotone" dataKey="diselesaikan" name="Tugasan Diselesaikan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#003B73] p-6 md:p-8 rounded-2xl border border-[#002f5c] shadow-md flex flex-col justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
               <svg className="w-16 h-16 mx-auto text-blue-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
               <h3 className="text-xl font-bold text-white mb-2">Peti Masuk Tugasan</h3>
               <p className="text-blue-100 text-sm mb-6">Uruskan cadangan yang dipanjangkan ke bahagian anda dengan segera.</p>
               <Link href="/bahagian/tugasan" className="w-full bg-white text-[#003B73] px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors font-bold shadow-sm">
                 Buka Senarai Tugasan
               </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// KOMPONEN REUSABLE UNTUK KAD STATISTIK
// -------------------------------------------------------------
function StatCard({ title, value, color }: { title: string, value: string | number, color: string }) {
  const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
    slate: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  };

  const selectedColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`rounded-2xl border ${selectedColor.border} bg-white p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden group`}>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${selectedColor.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <p className={`text-3xl md:text-4xl font-extrabold ${selectedColor.text}`}>{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}