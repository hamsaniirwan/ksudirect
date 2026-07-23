"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("YBhg. Dato' / Datin");
  
  // State untuk menyimpan ucapan sapaan
  const [greeting, setGreeting] = useState("Selamat Datang");

  // State untuk Dropdown Tahun (Secara lalai, guna tahun semasa)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.name) setUserName(userObj.name);
      } catch (e) {
        console.error("Gagal membaca profil pengguna", e);
      }
    }
  }, []);

  // Fetch data akan dipanggil semula setiap kali 'selectedYear' berubah
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        // Hantar tahun yang dipilih sebagai query parameter ke Laravel
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard?year=${selectedYear}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status === "success") {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear]);

  const today = new Date().toLocaleDateString("ms-MY", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F2EEE4]/40">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
        `}</style>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A1F3D] border-t-transparent shadow-sm"></div>
        <p className="mt-4 font-body text-sm font-medium text-[#64748B] tracking-wide">Menyediakan Ruang Kerja Eksekutif...</p>
      </div>
    );
  }

  const kpi = data?.kpi || { total: 0, pending: 0, forwarded: 0, completed: 0 };
  
  // Data terus dari Laravel API
  const yearlyData = data?.charts?.yearlyData || [];
  const monthlyData = data?.charts?.monthlyData || [];
  const divisionData = data?.charts?.divisionData || [];

  return (
    <div className="p-6 md:p-8 mx-auto min-h-screen bg-[#F2EEE4]/40 font-body">
      {/* Institutional type system: Fraunces for headings, IBM Plex Sans for UI */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Fraunces", ui-serif, Georgia, serif;
          font-optical-sizing: auto;
        }
        .font-body {
          font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* HEADER EKSEKUTIF */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#B08B3E] uppercase tracking-[0.25em] mb-2">
            Papan Pemuka KSU Direct
          </p>
          <h1 className="font-display text-3xl font-medium text-[#0A1F3D] tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 text-[#64748B] text-sm md:text-base">
            Ringkasan analitik dan status cadangan penambahbaikan setakat <span className="font-semibold text-[#1F2937]">{today}</span>.
          </p>
        </div>
        <div className="shrink-0 flex gap-3">
           <Link href="/admin/peti-masuk" className="inline-flex items-center gap-2 bg-[#0A1F3D] text-white px-5 py-2.5 rounded-xl hover:bg-[#0F2A4D] transition-all shadow-md hover:shadow-lg font-medium text-sm">
             Buka Peti Masuk
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </Link>
        </div>
      </div>

      {/* KAD 1: JUMLAH KESELURUHAN (HERO CARD) */}
      <div className="relative bg-[#0A1F3D] rounded-2xl shadow-lg mb-6 overflow-hidden flex flex-col md:flex-row justify-between border border-[#0A1F3D] group">
        {/* Guilloché-style security pattern, echoing the official document watermark on the login screen */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 400 200"
          aria-hidden="true"
        >
          <defs>
            <pattern id="guilloche-dash" width="100" height="46" patternUnits="userSpaceOnUse">
              <path d="M0,23 C25,0 25,46 50,23 C75,0 75,46 100,23" fill="none" stroke="#C6A15B" strokeWidth="1" />
              <path d="M0,10 C25,-13 25,33 50,10 C75,-13 75,33 100,10" fill="none" stroke="#C6A15B" strokeWidth="0.6" />
              <path d="M0,36 C25,13 25,59 50,36 C75,13 75,59 100,36" fill="none" stroke="#C6A15B" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#guilloche-dash)" />
        </svg>

        <div className="relative p-8 md:p-10 z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 shadow-inner backdrop-blur-sm">
              <svg className="w-6 h-6 text-[#C6A15B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-white uppercase tracking-[0.2em]">
              Jumlah Keseluruhan Cadangan
            </h2>
          </div>
          <p className="text-[#B9C4D6] text-sm max-w-xl leading-relaxed">
            Ringkasan jumlah cadangan penambahbaikan yang telah diterima oleh Kementerian Pengangkutan (MOT) semenjak inisiatif ini dilancarkan.
          </p>
        </div>

        <div className="relative bg-[#081A34] w-full md:w-72 flex items-center justify-center p-10 md:p-0 border-t md:border-t-0 md:border-l border-[#C6A15B]/15 overflow-hidden transition-colors group-hover:bg-[#071730]">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none transform scale-150">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 9h4v11H4zm6-6h4v17h-4zm6 4h4v13h-4z" />
            </svg>
          </div>
          <p className="relative z-10 font-display text-7xl md:text-8xl font-medium text-white drop-shadow-lg tracking-tight">
            {kpi.total}
          </p>
        </div>
      </div>

      {/* 3 KAD STATISTIK PECAHAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C6A15B]"></div>
          <div className="flex items-start justify-between mb-6">
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-[0.2em] mt-1">Belum Diteliti</p>
            <div className="p-2.5 bg-[#FBF3E4] text-[#B08B3E] rounded-xl group-hover:bg-[#C6A15B] group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p className="font-display text-4xl md:text-5xl font-medium text-[#0A1F3D]">{kpi.pending}</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#375374]"></div>
          <div className="flex items-start justify-between mb-6">
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-[0.2em] mt-1">Dipanjangkan</p>
            <div className="p-2.5 bg-[#EDF1F6] text-[#375374] rounded-xl group-hover:bg-[#375374] group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
            </div>
          </div>
          <p className="font-display text-4xl md:text-5xl font-medium text-[#0A1F3D]">{kpi.forwarded}</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0F6D48]"></div>
          <div className="flex items-start justify-between mb-6">
            <p className="text-sm font-semibold text-[#64748B] uppercase tracking-[0.2em] mt-1">Selesai / Ditutup</p>
            <div className="p-2.5 bg-[#E8F5EE] text-[#0F6D48] rounded-xl group-hover:bg-[#0F6D48] group-hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <p className="font-display text-4xl md:text-5xl font-medium text-[#0A1F3D]">{kpi.completed}</p>
        </div>
      </div>

      {/* GRID VISUALISASI DATA (CARTA / GRAF) */}
      
      {/* BARIS 1: Graf Bulanan & Graf Tahunan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* GRAF 1: Analitik Bulanan Mengikut Status (Lebar - 2 Column) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm lg:col-span-2 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0A1F3D] border-t-transparent"></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-display text-lg font-medium text-[#0A1F3D]">Trend Status Cadangan (Bulanan)</h3>
              <p className="text-sm text-[#64748B]">Pergerakan dan taburan cadangan sepanjang tahun.</p>
            </div>
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
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBDD" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontFamily: 'IBM Plex Sans'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontFamily: 'IBM Plex Sans'}} />
                <Tooltip 
                  cursor={{fill: '#F7F5EF'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #E5E0D3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'IBM Plex Sans'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px', fontFamily: 'IBM Plex Sans'}} />
                <Bar dataKey="pending" name="Belum Diteliti" stackId="a" fill="#C6A15B" maxBarSize={40} />
                <Bar dataKey="forwarded" name="Dipanjangkan" stackId="a" fill="#375374" maxBarSize={40} />
                <Bar dataKey="completed" name="Selesai/Ditutup" stackId="a" fill="#0F6D48" maxBarSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAF 2: Trend Keseluruhan Tahunan (Kecil - 1 Column) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="font-display text-lg font-medium text-[#0A1F3D]">Pertumbuhan Tahunan</h3>
            <p className="text-sm text-[#64748B]">Jumlah penerimaan sejak awal.</p>
          </div>
          <div className="h-[300px] w-full mt-auto">
            {yearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A1F3D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0A1F3D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBDD" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontFamily: 'IBM Plex Sans'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontFamily: 'IBM Plex Sans'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #E5E0D3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'IBM Plex Sans'}}
                  />
                  <Area type="monotone" dataKey="total" name="Jumlah" stroke="#0A1F3D" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-sm text-[#94A3B8]">Tiada data direkodkan.</div>
            )}
          </div>
        </div>

      </div>

      {/* BARIS 2: Graf Mengikut Bahagian & Status Semasa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAF 3: Pengagihan Bahagian (Lebar - 2 Column) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm lg:col-span-2">
          <div className="mb-8">
            <h3 className="font-display text-lg font-medium text-[#0A1F3D]">Tugasan Mengikut Bahagian / Agensi</h3>
            <p className="text-sm text-[#64748B]">Bahagian yang paling kerap menerima cadangan penambahbaikan (Top 5).</p>
          </div>
          
          <div className="h-[300px] w-full">
            {divisionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EBDD" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontFamily: 'IBM Plex Sans'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1F2937', fontSize: 12, fontWeight: 500, fontFamily: 'IBM Plex Sans'}} width={120} />
                  <Tooltip 
                    cursor={{fill: '#F7F5EF'}}
                    contentStyle={{borderRadius: '12px', border: '1px solid #E5E0D3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'IBM Plex Sans'}}
                  />
                  <Bar dataKey="total" name="Jumlah Cadangan" fill="#0A1F3D" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#94A3B8]">Tiada bahagian direkodkan setakat ini.</div>
            )}
          </div>
        </div>

        {/* Notifikasi Status Tindakan (Kecil - 1 Column) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E0D3] shadow-sm flex flex-col">
          <h3 className="font-display text-lg font-medium text-[#0A1F3D] mb-6">Tindakan Segera</h3>
          
          {kpi.pending > 0 ? (
            <div className="bg-[#FBF3E4] border border-[#C6A15B]/30 rounded-xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C6A15B]/10 rounded-bl-full -mr-4 -mt-4"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#F0E2C4] rounded-lg text-[#B08B3E]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <p className="font-display font-medium text-[#7A5A20] tracking-wide text-lg">Perhatian!</p>
              </div>
              <p className="text-sm text-[#8A6A2E] leading-relaxed mb-6 font-medium">
                Terdapat <span className="font-bold text-[#7A5A20] bg-[#F0E2C4] px-2 py-0.5 rounded mx-1">{kpi.pending}</span> cadangan baharu yang belum dibaca dan diuruskan.
              </p>
              <Link href="/admin/peti-masuk" className="mt-auto block w-full text-center text-sm font-semibold text-white bg-[#B08B3E] hover:bg-[#96742E] py-3.5 rounded-xl shadow-sm transition-all hover:shadow-md">
                Urus Peti Masuk
              </Link>
            </div>
          ) : (
            <div className="bg-[#E8F5EE] border border-[#0F6D48]/15 rounded-xl p-6 text-center flex-1 flex flex-col items-center justify-center">
              <div className="mx-auto w-16 h-16 bg-white shadow-sm border border-[#0F6D48]/15 text-[#0F6D48] rounded-full flex items-center justify-center mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-display font-medium text-[#0A1F3D] mb-2 text-lg">Sifar Tertunggak</p>
              <p className="text-sm text-[#3F6E58] leading-relaxed font-medium">
                Syabas! Anda telah menyelesaikan kesemua saringan awal dalam sistem.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}