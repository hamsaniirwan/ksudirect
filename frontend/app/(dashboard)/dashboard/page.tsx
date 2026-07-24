"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan ucapan sapaan
  const [greeting, setGreeting] = useState("Selamat Datang");

  // State untuk Pilihan Tahun (Lalai: Tahun Semasa)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // State untuk menyimpan data mentah dari API & data yang dah diproses
  const [rawData, setRawData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fungsi untuk tentukan ucapan mengikut waktu
    const determineGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 0 && currentHour < 12) {
        setGreeting("Selamat Pagi");
      } else if (currentHour >= 12 && currentHour < 14) {
        setGreeting("Selamat Tengah Hari");
      } else if (currentHour >= 14 && currentHour < 19) {
        setGreeting("Selamat Petang");
      } else {
        setGreeting("Selamat Malam");
      }
    };
    determineGreeting();

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
    // ====================================================================
    if (["admin", "ksu", "special_officer", "pegawai_khas"].includes(currentRole)) {
      router.push("/admin/papan-pemuka"); 
      return; 
    }

    // ====================================================================
    // 2. FETCH DATA SEBENAR DARI LARAVEL (API) - Panggil Sekali Sahaja
    // ====================================================================
    const fetchDashboardData = async (role: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      let endpoint = "";
      if (role === "pengguna" || role === "officer" || role === "user") {
        endpoint = "/suggestions"; 
      } else if (role === "division_head" || role === "bahagian") {
        endpoint = "/bahagian/tasks"; 
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           console.error("Sesi luput atau format tidak disokong.");
           localStorage.removeItem("token");
           localStorage.removeItem("user");
           router.push("/");
           return;
        }

        const result = await res.json();

        if (res.ok && result.status === "success") {
          setRawData(result.data); // Simpan data mentah
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
        }
      } catch (err) {
        console.error("Gagal mendapatkan data papan pemuka:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData(currentRole);
  }, [router]);

  // ====================================================================
  // 3. PROSES DATA UNTUK GRAF MENGIKUT TAHUN YANG DIPILIH
  // ====================================================================
  useEffect(() => {
    if (!userRole) return; // Jangan proses selagi role tak jumpa

    const monthsName = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

    // ----------------------------------------------------
    // PENGKIRAAN UNTUK PENGGUNA BIASA (PEGAWAI MOT)
    // ----------------------------------------------------
    if (userRole === "pengguna" || userRole === "officer" || userRole === "user") {
      let draft = 0, pending = 0, active = 0, completed = 0;
      const chartData = monthsName.map(m => ({ month: m, dihantar: 0, selesai: 0 }));

      rawData.forEach((item: any) => {
        const st = item.status;
        
        // Kiraan KPI (Semua Tahun - All Time)
        if (st === "Draft" || st === "Draf") draft++;
        else if (st === "Baharu") pending++;
        else if (["Selesai", "Tiada Tindakan Lanjut", "Ditutup"].includes(st)) completed++;
        else active++;

        // Kiraan Graf Bulanan (Ditapis mengikut Tahun Pilihan)
        const createdYear = new Date(item.created_at).getFullYear().toString();
        if (createdYear === selectedYear && st !== "Draft" && st !== "Draf") {
          const monthIdx = new Date(item.created_at).getMonth();
          chartData[monthIdx].dihantar++;
        }

        const updatedYear = new Date(item.updated_at || item.created_at).getFullYear().toString();
        if (updatedYear === selectedYear && ["Selesai", "Tiada Tindakan Lanjut", "Ditutup"].includes(st)) {
          const monthIdxDone = new Date(item.updated_at || item.created_at).getMonth();
          chartData[monthIdxDone].selesai++;
        }
      });

      setStats({
        kpi: { draft, pending, active, completed },
        chart: chartData
      });
    } 
    // ----------------------------------------------------
    // PENGKIRAAN UNTUK KETUA BAHAGIAN
    // ----------------------------------------------------
    else if (userRole === "division_head" || userRole === "bahagian") {
      let newTasks = 0, inProgress = 0, returned = 0, completedTasks = 0;
      const chartDataDiv = monthsName.map(m => ({ month: m, diterima: 0, diselesaikan: 0 }));

      rawData.forEach((item: any) => {
        const st = item.status;

        // Kiraan KPI (Semua Tahun - All Time)
        if (st === "Telah Dipanjangkan ke Bahagian") newTasks++;
        else if (st === "Dalam Tindakan") inProgress++;
        else if (["Semak Semula", "Dikembalikan"].includes(st)) returned++;
        else if (["Selesai", "Tiada Tindakan Lanjut", "Ditutup"].includes(st)) completedTasks++;

        // Kiraan Graf Bulanan (Ditapis mengikut Tahun Pilihan)
        const createdYear = new Date(item.created_at).getFullYear().toString();
        if (createdYear === selectedYear) {
          const monthIdx = new Date(item.created_at).getMonth();
          chartDataDiv[monthIdx].diterima++;
        }
        
        const updatedYear = new Date(item.updated_at || item.created_at).getFullYear().toString();
        if (updatedYear === selectedYear && ["Selesai", "Tiada Tindakan Lanjut", "Ditutup"].includes(st)) {
          const monthIdxDone = new Date(item.updated_at || item.created_at).getMonth();
          chartDataDiv[monthIdxDone].diselesaikan++;
        }
      });

      setStats({
        kpi: { new: newTasks, in_progress: inProgress, returned, completed: completedTasks },
        chart: chartDataDiv
      });
    }
  }, [rawData, selectedYear, userRole]); // Akan dikira semula bila tahun bertukar

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

  if (loading || ["admin", "ksu", "special_officer", "pegawai_khas"].includes(userRole)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-body">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A1F3D] border-t-transparent shadow-sm"></div>
        <p className="mt-4 text-sm font-medium text-[#64748B]">Memuatkan ruang kerja...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen p-4 font-body md:p-8">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap");
        .font-display { font-family: "Fraunces", ui-serif, Georgia, serif; font-optical-sizing: auto; }
        .font-body { font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* HEADER DASHBOARD */}
      <div className="mb-8 md:mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#B08B3E]">
          Ruang Kerja Utama
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[#0A1F3D]">
          {greeting}, {userName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#64748B] md:text-base">
          <p>Papan pemuka pengurusan cadangan dan tugasan.</p>
          <span className="inline-block rounded-full border border-[#E5D3A8] bg-[#FBF3E3] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#8A6A22]">
            {currentRoleName}
          </span>
        </div>
      </div>

      {/* =========================================
          PAPARAN 1: PEGAWAI MOT (USER BIASA)
      ========================================= */}
      {(userRole === "pengguna" || userRole === "officer" || userRole === "user") && stats && (
        <div className="animate-in fade-in space-y-8 duration-500">
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-[#0F2A4D] bg-[#0A1F3D] p-8 shadow-lg md:flex-row md:p-10">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 500 200" aria-hidden="true">
              <defs>
                <pattern id="cta-guilloche" width="90" height="42" patternUnits="userSpaceOnUse">
                  <path d="M0,21 C22,0 22,42 45,21 C67,0 67,42 90,21" fill="none" stroke="#C6A15B" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="500" height="200" fill="url(#cta-guilloche)" />
            </svg>
            <div className="relative z-10 text-center md:text-left">
              <h2 className="font-display mb-2 text-2xl font-semibold text-white md:text-3xl">Ada Cadangan Penambahbaikan?</h2>
              <p className="max-w-xl text-sm text-[#B9C4D6] md:text-base">Setiap pandangan anda amat bernilai untuk kemajuan Kementerian Pengangkutan. Suarakan cadangan anda hari ini.</p>
            </div>
            <Link href="/pengguna/hantar-cadangan" className="relative z-10 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C6A15B] px-8 py-3.5 font-bold text-[#0A1F3D] shadow-md transition-colors hover:bg-[#D4B274] md:w-auto">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Cipta Cadangan Baharu
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            <StatCard title="Draf Disimpan" value={stats.kpi.draft} color="slate" />
            <StatCard title="Sedang Disemak (KSU)" value={stats.kpi.pending} color="amber" />
            <StatCard title="Tindakan Bahagian" value={stats.kpi.active} color="blue" />
            <StatCard title="Selesai / Ditutup" value={stats.kpi.completed} color="emerald" />
          </div>

          <div className="rounded-2xl border border-[#E5E0D3] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-display text-lg font-semibold text-[#0A1F3D]">Aktiviti Penghantaran Anda</h3>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-[#F7F5EF] border border-[#DDD7C7] text-[#1F2937] text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#0A1F3D] font-medium"
              >
                <option value={new Date().getFullYear().toString()}>Tahun {new Date().getFullYear()}</option>
                <option value={(new Date().getFullYear() - 1).toString()}>Tahun {new Date().getFullYear() - 1}</option>
                <option value={(new Date().getFullYear() - 2).toString()}>Tahun {new Date().getFullYear() - 2}</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBDD" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F9F7F0" }} contentStyle={{ borderRadius: "12px", border: "1px solid #E5E0D3" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Bar dataKey="dihantar" name="Cadangan Dihantar" fill="#0A1F3D" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="selesai" name="Telah Selesai" fill="#C6A15B" radius={[4, 4, 0, 0]} maxBarSize={50} />
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
        <div className="animate-in fade-in space-y-8 duration-500">
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            <StatCard title="Tugasan Baharu" value={stats.kpi.new} color="red" />
            <StatCard title="Dalam Tindakan" value={stats.kpi.in_progress} color="amber" />
            <StatCard title="Dikembalikan (Semak)" value={stats.kpi.returned} color="indigo" />
            <StatCard title="Tugasan Selesai" value={stats.kpi.completed} color="emerald" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E0D3] bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-display text-lg font-semibold text-[#0A1F3D]">Trend Penyelesaian Tugasan Bahagian</h3>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#F7F5EF] border border-[#DDD7C7] text-[#1F2937] text-sm rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#0A1F3D] font-medium"
                >
                  <option value={new Date().getFullYear().toString()}>Tahun {new Date().getFullYear()}</option>
                  <option value={(new Date().getFullYear() - 1).toString()}>Tahun {new Date().getFullYear() - 1}</option>
                  <option value={(new Date().getFullYear() - 2).toString()}>Tahun {new Date().getFullYear() - 2}</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDiterima" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A1F3D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0A1F3D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBDD" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E0D3" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                    <Area type="monotone" dataKey="diterima" name="Tugasan Diterima" stroke="#C6A15B" strokeWidth={3} fillOpacity={1} fill="url(#colorDiterima)" />
                    <Area type="monotone" dataKey="diselesaikan" name="Tugasan Diselesaikan" stroke="#0A1F3D" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#0F2A4D] bg-[#0A1F3D] p-6 text-center shadow-md md:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/5"></div>
              <svg className="mx-auto mb-4 h-16 w-16 text-[#C6A15B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="font-display mb-2 text-xl font-semibold text-white">Peti Masuk Tugasan</h3>
              <p className="mb-6 text-sm text-[#B9C4D6]">Uruskan cadangan yang dipanjangkan ke bahagian anda dengan segera.</p>
              <Link href="/bahagian/tugasan" className="w-full rounded-xl bg-[#C6A15B] px-4 py-3 font-bold text-[#0A1F3D] shadow-sm transition-colors hover:bg-[#D4B274]">
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
function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-[#EAF0F8]", text: "text-[#0A1F3D]", border: "border-[#D6E1EF]" },
    amber: { bg: "bg-[#FBF3E3]", text: "text-[#8A6A22]", border: "border-[#E5D3A8]" },
    emerald: { bg: "bg-[#EAF6EF]", text: "text-[#0F6B41]", border: "border-[#CDE9DA]" },
    indigo: { bg: "bg-[#EEEDF9]", text: "text-[#463F9E]", border: "border-[#D9D6F0]" },
    red: { bg: "bg-[#FDEEEC]", text: "text-[#B42318]", border: "border-[#F5D0CC]" },
    slate: { bg: "bg-[#F2EEE4]", text: "text-[#4B5563]", border: "border-[#E5E0D3]" },
  };

  const selectedColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${selectedColor.border} bg-white p-5 shadow-sm transition-all hover:shadow-md`}>
      <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full ${selectedColor.bg} opacity-50 transition-transform duration-500 group-hover:scale-150`}></div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#64748B]">{title}</p>
          <p className={`font-display text-3xl font-semibold md:text-4xl ${selectedColor.text}`}>{value}</p>
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