"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Gagal log masuk. Sila cuba lagi.");
      } else {
        setSuccessMessage("Log masuk berjaya! Mengalihkan halaman...");
        
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Semak jika ada parameter redirect dari pautan e-mel
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");

        setTimeout(() => {
          if (redirectUrl) {
            router.push(redirectUrl); // Halakan ke halaman cadangan tadi
          } else {
            router.push("/dashboard"); // Halakan ke dashboard utama
          }
        }, 1000); 
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Ralat sistem. Tidak dapat menyambung ke pangkalan pelayan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Logo Jata Negara */}
          <div className="mb-4 flex h-24 w-24 items-center justify-center">
            <Image 
              src="/logo/jata_negara.png" 
              alt="Logo Jata Negara" 
              width={96} 
              height={96} 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">KSU Direct</h1>
          <p className="mt-2 text-sm text-slate-500">
            Platform Rasmi Cadangan Penambahbaikan Kementerian Pengangkutan Malaysia
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              E-mel Rasmi (@mot.gov.my)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cth: pegawai@mot.gov.my"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-[#003B73] focus:outline-none focus:ring-1 focus:ring-[#003B73] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kata Laluan
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-[#003B73] focus:outline-none focus:ring-1 focus:ring-[#003B73] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#003B73] px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#002f5c] focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2 disabled:opacity-70 transition-all"
          >
            {loading ? "Sedang Log Masuk..." : "Log Masuk"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Hanya kakitangan kementerian dengan e-mel rasmi @mot.gov.my dibenarkan mengakses sistem ini.</p>
        </div>
      </div>
    </main>
  );
}