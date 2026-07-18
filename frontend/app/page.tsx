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
        // Papar ralat daripada Laravel (ValidationException)
        setErrorMessage(data.message || "Gagal log masuk. Sila cuba lagi.");
      } else {
        // Log masuk berjaya
        setSuccessMessage("Log masuk berjaya! Mengalihkan halaman...");
        
        // Simpan token untuk sesi akan datang
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // TODO: Redirect ke Dashboard menggunakan useRouter() dari next/navigation
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000); // Beri masa 1 saat untuk pengguna baca mesej berjaya
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
        
        {/* Bahagian Header/Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#003B73] shadow-md">
            <span className="text-2xl font-bold text-white">KSU</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">KSU Direct</h1>
          <p className="mt-2 text-sm text-slate-500">
            Platform Rasmi Cadangan Penambahbaikan Kementerian Pengangkutan Malaysia
          </p>
        </div>

        {/* Paparan Ralat / Sukses */}
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

        {/* Borang Log Masuk */}
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

        {/* Nota Tambahan */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Hanya kakitangan kementerian dengan e-mel rasmi @mot.gov.my dibenarkan mengakses sistem ini.</p>
        </div>
      </div>
    </main>
  );
}